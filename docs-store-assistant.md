# Master Store shopping assistant

The storefront, plan pages, cart, account, tracking, policy and generated category pages load `store-assistant.js` and `store-assistant.css`. The widget only calls the same-origin `POST /api/store-assistant` endpoint. It keeps conversation history in tab memory and clears it through New chat. No chat transcript is written to the database.

The endpoint uses Vercel AI Gateway, authenticating with an existing `AI_GATEWAY_API_KEY` or the deployment's `VERCEL_OIDC_TOKEN`. No key belongs in the browser or source. The default model `google/gemini-3.5-flash-lite` was verified in the live Gateway model catalogue on 2026-10-25. Its listed rates were $0.30 per million input tokens and $2.50 per million output tokens. Requests are limited to 1,000 output tokens. `STORE_ASSISTANT_MODEL` may override the server model. `STORE_ASSISTANT_DISABLED=1` disables generation and leaves the explicitly labelled catalogue fallback available. Deployment authentication still requires Gateway team verification/credits. Do not enable automatic credit purchases without approval.

Product data is read from the existing trusted catalogue; current EGP prices and availability are fetched from the public, RLS-protected Supabase price table for each question. No service-role credential, private order data, wallet data, login secrets, payment actions or database writes are used. If live prices cannot be fetched, the model receives null prices and unavailable purchase states. Store policies come from the 30 Arabic policy lines in `warranty.html`. Prompt text explicitly prioritizes server price fields over price wording in product descriptions.

The server accepts only bounded user/assistant messages, fixes the model and system prompt server-side, limits output, checks browser origin, and applies best-effort per-instance burst protection. This in-memory burst guard does not enforce an account-wide spending ceiling across Vercel instances. Set an appropriate project-level AI Gateway budget in Vercel before expanding traffic; never assume request limits replace a billing budget. The assistant cannot approve refunds, confirm payments or read an order's status. Product links and support links are filtered in the UI; replies are rendered as text, never HTML.

If upstream authentication, credits, capacity or timeouts fail, the response has `mode: catalog`; the widget labels it as catalogue details rather than an AI response. Runtime logs record only safe status/category markers, not questions, prompts, provider error bodies, tokens or authorization headers.

Validation:

```
node tests/store-assistant.test.cjs
CHROMIUM_EXECUTABLE_PATH=/path/to/chromium node tests/store-assistant-ui.test.cjs
node scripts/build-seo.cjs
node tests/seo.test.cjs
```

The UI test excludes the existing unrelated `customer-stories.js` missing-dialog error from its error assertion; assistant errors still fail the test. Live verification must confirm `mode: ai`, current plan price, a plan link, and the expected production deployment before reporting AI as active.
