// Run after npm run build with Playwright and Chromium available.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { chromium } = require('playwright');

const base = path.resolve(__dirname, '../_site');
const mime = {
  '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css',
  '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.woff2': 'font/woff2'
};
const server = http.createServer((request, response) => {
  const pathname = new URL(request.url, 'http://localhost').pathname;
  const file = path.resolve(base, '.' + pathname);
  if (!file.startsWith(base + path.sep)) {
    response.writeHead(404).end();
    return;
  }
  try {
    const bytes = fs.readFileSync(file);
    response.setHeader('Content-Type', mime[path.extname(file)] || 'application/octet-stream');
    response.end(bytes);
  } catch {
    response.writeHead(404).end();
  }
});

(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const origin = 'http://127.0.0.1:' + server.address().port;
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_EXECUTABLE_PATH,
    args: ['--no-sandbox', '--disable-dev-shm-usage']
  });

  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
    const errorMessages = [];
    page.on('pageerror', error => errorMessages.push(error.message));
    await page.addInitScript(() => {
      if (!localStorage.getItem('masterStoreLocaleV1')) {
        localStorage.setItem('masterStoreLocaleV1', JSON.stringify({
          language: 'en', market: 'EG', manualMarket: true
        }));
      }
    });

    const product = 'ChatGPT Plus';
    const plan = 'Personal account · one month';
    const orderId = '11111111-2222-4333-8444-555555555555';
    const deliveryId = '21111111-2222-4333-8444-555555555555';
    const deliveryKey = 'b'.repeat(64);
    const deliveryPayload = 'Simulated delivery. No usable login credentials.';
    const checkoutCalls = [];
    let price = 88000;
    let submittedOrder;
    let savedReceipt;
    let deliveryClaim;

    const quote = items => {
      const lines = items.map(item => ({
        ...item, product, plan, duration: '1 month', unit_piasters: price,
        max_quantity: 5, amount_piasters: price * item.quantity,
        subtotal_piasters: price * item.quantity, discount_piasters: 0
      }));
      const total = lines.reduce((sum, line) => sum + line.amount_piasters, 0);
      return {
        items: lines, subtotal_piasters: total, amount_piasters: total,
        discount_piasters: 0, discount_percent: 0
      };
    };

    await page.route('**/*', async route => {
      const request = route.request();
      const url = new URL(request.url());
      if (url.origin === origin) return route.continue();
      if (url.hostname !== 'gmysuhoebcapigdidnnv.supabase.co') return route.abort();

      const headers = { 'access-control-allow-origin': '*' };
      if (request.method() === 'OPTIONS') {
        return route.fulfill({ status: 204, headers: {
          ...headers, 'access-control-allow-headers': '*', 'access-control-allow-methods': 'GET, POST, OPTIONS'
        } });
      }

      const reply = (json, status = 200) => route.fulfill({ status, headers, json });
      const body = request.postDataJSON();
      switch (url.pathname) {
        case '/auth/v1/settings':
          return reply({ external: {} });
        case '/rest/v1/master_store_plans':
          return reply([]);
        case '/rest/v1/rpc/master_store_quote_cart':
          return reply(quote(body.items));
        case '/rest/v1/rpc/master_store_guest_checkout': {
          checkoutCalls.push(body);
          if (checkoutCalls.length === 1) {
            price = 89000;
            return reply({ code: 'P0001', message: 'PRICE_CHANGED' }, 400);
          }
          assert.equal(body.quoted_amount, price);
          if (!submittedOrder) {
            savedReceipt = { request_id: body.request_id, receipt_token: body.receipt_token };
            submittedOrder = {
              ...quote(body.items).items[0], id: orderId, cart_id: body.request_id, customer: body.contact,
              created_at: '2026-11-27T12:00:00Z', status: 'pending_payment', payment: body.method
            };
            return reply({ message: 'Simulated connection interruption after saving' }, 503);
          }
          assert.deepEqual({ request_id: body.request_id, receipt_token: body.receipt_token }, savedReceipt);
          return reply({ cart_id: body.request_id, orders: [submittedOrder] });
        }
        case '/rest/v1/rpc/master_store_guest_receipt':
          assert.deepEqual(body, savedReceipt);
          return reply([submittedOrder]);
        case '/rest/v1/rpc/master_delivery': {
          assert.equal(body.delivery_id, deliveryId);
          assert.equal(body.access_token, deliveryKey);
          assert.ok(['processing', 'completed'].includes(submittedOrder.status));
          if (body.action === 'preview') return reply({ product, plan, claimed: !!deliveryClaim });
          if (body.action === 'claim') {
            deliveryClaim = body.details.claim_key;
            submittedOrder.status = 'completed';
          } else {
            assert.equal(body.action, 'read');
            assert.equal(body.details.claim_key, deliveryClaim);
          }
          return reply({ product, plan, payload: deliveryPayload });
        }
        default:
          return route.abort();
      }
    });

    await page.goto(origin + '/products/chatgpt-plus.html?plan=2');
    await page.locator('#mobileBuyBtn').click();
    await page.locator('[data-purchase="checkout"]').click();
    await page.waitForURL('**/cart.html#cartCheckout');
    const confirmOrder = page.locator('.cart-submit');
    await page.locator('input[name=name]').fill('Checkout fixture');
    await page.locator('input[name=phone]').fill('01000000001');
    await page.locator('input[name=email]').fill('checkout@example.invalid');
    await page.locator('input[name=payment][value="Vodafone Cash"]').check();

    await confirmOrder.click();
    await page.locator('.cart-price-update').waitFor();
    assert.match(await page.locator('.cart-total b').textContent(), /890/);
    assert.equal(await page.locator('input[name=name]').inputValue(), 'Checkout fixture');
    assert.equal(await page.locator('input[name=payment]:checked').inputValue(), 'Vodafone Cash');
    assert.equal(checkoutCalls.length, 1, 'price changes require explicit customer confirmation');

    await confirmOrder.click();
    await page.waitForFunction(() => document.getElementById('cartError')?.textContent);
    assert.equal(await page.locator('.cart-line').count(), 1, 'lost responses keep the cart intact');
    await confirmOrder.click();
    await page.locator('.cart-success').waitFor();
    const cartReference = (await page.locator('.cart-receipt-number span').textContent()).trim();
    assert.equal(cartReference, savedReceipt.request_id);
    assert.equal(checkoutCalls.length, 3);
    assert.equal(await page.evaluate(() => MasterCart.read().length), 0);

    await page.locator('.cart-success a[href^="invoice.html"]').click();
    await page.locator('.invoice-sheet').waitFor();
    assert.match(await page.locator('.invoice-status').textContent(), /Awaiting payment confirmation/);
    const printableNumber = (await page.locator('.invoice-number').textContent()).trim();
    assert.equal(printableNumber, 'MS-C-' + cartReference.toUpperCase());
    await page.locator('#backLink').click();
    await page.locator('.tracking-card').waitFor();
    assert.equal(await page.locator('#trackingId').inputValue(), cartReference);
    await page.locator('#trackingId').fill(printableNumber);
    await page.locator('#trackingForm [type=submit]').click();
    await page.waitForFunction(() => document.getElementById('trackingResults').getAttribute('aria-busy') === 'false');
    assert.equal(await page.locator('.tracking-card').count(), 1);
    assert.match(await page.locator('.tracking-progress [aria-current=step]').textContent(), /Awaiting payment/);

    await page.locator('.tracking-card a[href^="invoice.html?id="]').click();
    await page.locator('.invoice-sheet').waitFor();
    const printableItemNumber = (await page.locator('.invoice-number').textContent()).trim();
    assert.equal(printableItemNumber, 'MS-O-' + orderId.toUpperCase());
    await page.locator('#backLink').click();
    await page.locator('.tracking-card').waitFor();
    assert.equal(await page.locator('#trackingId').inputValue(), orderId);
    await page.locator('#trackingId').fill(printableItemNumber);
    await page.locator('#trackingForm [type=submit]').click();
    await page.waitForFunction(() => document.getElementById('trackingResults').getAttribute('aria-busy') === 'false');
    assert.equal(await page.locator('.tracking-card').count(), 1);

    submittedOrder.status = 'processing';
    await page.locator('#trackingRefresh').click();
    await page.locator('.tracking-progress [aria-current=step]').getByText('Processing').waitFor();

    const deliveryUrl = origin + '/delivery.html#id=' + deliveryId + '&key=' + deliveryKey;
    await page.goto(deliveryUrl);
    await page.locator('#claimForm input[name=recipient_name]').fill('Checkout fixture');
    await page.locator('#claimForm button[type=submit]').click();
    await page.getByText(deliveryPayload, { exact: true }).waitFor();
    assert.ok(deliveryClaim);
    await page.reload();
    await page.getByText(deliveryPayload, { exact: true }).waitFor();

    await page.goto(origin + '/track.html#order=' + encodeURIComponent(printableNumber));
    await page.locator('.tracking-progress [aria-current=step]').getByText('Completed').waitFor();
    assert.deepEqual(errorMessages, []);
    console.log('PASS: guest checkout, updated quote, retry, invoice reference, tracking stages, and simulated delivery recovery.');
  } finally {
    await browser.close();
    server.close();
  }
})().catch(error => {
  console.error(error);
  server.close();
  process.exitCode = 1;
});
