(() => {
  'use strict';

  const form = document.getElementById('wholesaleRequestForm');
  if (!form) return;

  const { service, plan, quantity, details } = form.elements;
  const list = document.getElementById('wholesaleServices');
  const support = window.MasterSocialLinks?.whatsappSupport || document.getElementById('wholesaleContact').href;
  const locale = window.MasterLocale;
  const t = (ar, en) => document.documentElement.lang === 'en' ? en : ar;
  const params = new URLSearchParams(window.location.search);
  const requestedProduct = window.MasterCatalog?.getProduct(params.get('wholesaleProduct'));
  const requestedIndex = params.get('wholesalePlan');
  const requestedPlan = requestedIndex !== null && /^\d+$/.test(requestedIndex)
    ? requestedProduct?.plans?.[Number(requestedIndex)] : null;
  let suggestedPlan = '';

  if (requestedProduct && !requestedProduct.redirectTo) service.value = requestedProduct.name;
  function translatePrefill() {
    if (!requestedPlan || requestedPlan.hidden || service.value.trim() !== requestedProduct.name || plan.value !== suggestedPlan) return;
    const value = requestedPlan.name || requestedPlan.duration || '';
    suggestedPlan = locale?.catalogText(value, 'planName', requestedProduct.id) || value;
    plan.value = suggestedPlan;
  }
  translatePrefill();
  document.addEventListener('masterstore:localechange', translatePrefill);
  service.addEventListener('input', () => {
    if (requestedProduct && service.value.trim() !== requestedProduct.name && plan.value === suggestedPlan) {
      plan.value = '';
      suggestedPlan = '';
    }
  });

  Promise.resolve(window.MasterCatalogReady).then(() => {
    const names = new Set((window.MasterCatalog?.products || [])
      .filter(product => product.status === 'available' && !product.redirectTo)
      .map(product => product.name));
    for (const name of names) {
      const option = document.createElement('option');
      option.value = name;
      list.append(option);
    }
  });

  for (const control of [service, quantity]) {
    control.addEventListener('input', () => control.setCustomValidity(''));
  }

  form.addEventListener('submit', event => {
    event.preventDefault();
    const name = service.value.trim();
    const count = quantity.valueAsNumber;
    service.setCustomValidity(name ? '' : t('اكتب اسم الخدمة المطلوبة.', 'Enter the requested service name.'));
    quantity.setCustomValidity(Number.isSafeInteger(count) && count > 0
      ? '' : t('اكتب الكمية كعدد صحيح أكبر من صفر.', 'Enter a whole quantity greater than zero.'));
    if (!form.reportValidity()) return;

    const message = [
      t('طلب عرض سعر للتجّار والموزّعين – MASTER STORE', 'Wholesale quote request – MASTER STORE'),
      t('الخدمة: ', 'Service: ') + name,
      plan.value.trim() && (t('الباقة أو المدة: ', 'Plan or duration: ') + plan.value.trim()),
      t('الكمية المطلوبة: ', 'Quantity needed: ') + count,
      details.value.trim() && (t('تفاصيل إضافية: ', 'Additional details: ') + details.value.trim())
    ].filter(Boolean).join('\n');

    const destination = new URL(support);
    destination.searchParams.set('text', message);
    window.location.assign(destination.href);
  });

  form.querySelector('[type=submit]').disabled = false;
})();
