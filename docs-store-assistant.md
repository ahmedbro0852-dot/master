# Master Store shopping assistant

The storefront, plan pages, cart, account, tracking, policy and generated category pages load `store-assistant.js` and `store-assistant.css`. The widget only calls the same-origin `POST /api/store-assistant` endpoint. It keeps conversation history in tab memory and clears it through New chat. No chat transcript is written to the database.

The endpoint uses the user's existing Aerolink Responses-compatible API. It accepts `AEROLINK_API_KEY1` (the newer production credential) or `AEROLINK_API_KEY`; on HTTP 401/403 it can try the other saved credential. Administrator configuration overrides the original integration defaults: `AEROLINK_BASE_URL=https://aerolink.lat`, `AEROLINK_RESPONSES_PATH=/responses`, `AEROLINK_MODEL=gpt-5.6-sol`. These defaults match repository commit `47c20bc`. If the configured Responses route is missing (HTTP 404/405), the same origin is retried at `/v1/responses` and `/responses`. Other errors do not trigger a route retry. The client cannot select a provider, model or system instructions. Requests allow 850 output tokens and a 20-second overall provider timeout. `STORE_ASSISTANT_DISABLED=1` leaves the labelled catalogue fallback available. It does not call Vercel AI Gateway and does not require Gateway billing verification. Credentials stay in server environment variables; never paste them into browser code or commit them.

Product data is read from the existing trusted catalogue; current EGP prices and availability are fetched from the public, RLS-protected Supabase price table for each question. No service-role credential, private order data, wallet data, login secrets, payment actions or database writes are used. If live prices cannot be fetched, the model receives null prices and unavailable purchase states. Store policies come from the 30 Arabic policy lines in `warranty.html`. Prompt text explicitly prioritizes server price fields over price wording in product descriptions.

The server accepts only bounded user/assistant messages, fixes the model and system prompt server-side, limits output, checks browser origin, and applies best-effort per-instance burst protection. This in-memory burst guard does not enforce an account-wide spending ceiling across Vercel instances. Set an appropriate provider spending limit before expanding traffic; never assume request limits replace a billing budget. The assistant cannot approve refunds, confirm payments or read an order's status. Product links and support links are filtered in the UI; replies are rendered as text, never HTML.

If upstream authentication, credits, capacity or timeouts fail, the response has `mode: catalog`; the widget labels it as catalogue details rather than an AI response. Runtime logs record only safe status/category markers, not questions, prompts, provider error bodies, tokens or authorization headers.

Validation:

```
node tests/store-assistant.test.cjs
CHROMIUM_EXECUTABLE_PATH=/path/to/chromium node tests/store-assistant-ui.test.cjs
node scripts/build-seo.cjs
node tests/seo.test.cjs
```

The UI test excludes the existing unrelated `customer-stories.js` missing-dialog error from its error assertion; assistant errors still fail the test. Live verification must confirm `mode: ai`, current plan price, a plan link, and the expected production deployment before reporting AI as active.
