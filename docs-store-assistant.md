# Master Store shopping assistant

The storefront, plan pages, cart, account, tracking, policy and generated category pages load `store-assistant.js` and `store-assistant.css`. The widget only calls the same-origin `POST /api/store-assistant` endpoint. It keeps conversation history in tab memory and clears it through New chat. No chat transcript is written to the database.

The endpoint uses the user-selected DarkAPI at `https://darkapi.shop/v1/chat/completions`, with Bearer authentication from the production-only sensitive environment variable `DARKAPI_API_KEY`. `DARKAPI_BASE_URL` and `DARKAPI_MODEL` are server configuration; the documented text model `gpt-6-luna` is the default. The supplied guide at `https://darkapi.shop/guide` and its public client bundle were reviewed on 2026-10-25: it documents Chat Completions with `model` and `messages`, Bearer authentication, and lists this model. The configured text model was verified by successful production generation.

Production verification succeeded on 2026-10-25 at `https://master-pi-six.vercel.app/api/store-assistant`: a real request returned `mode: ai`, `pricesVerified: true`, ElevenLabs Creator for 3 months at EGP 1,250, full warranty, and the correct plan link. The production request accepted the user's credential. An earlier local-network `/v1/models` probe returned 401; it was not representative of the deployed server and must not be treated as evidence that the key is invalid.

Never commit or print the key. Requests cap completion tokens at 1,000 and use a 20-second timeout. `STORE_ASSISTANT_DISABLED=1` leaves the labelled catalogue fallback available. Neither Aerolink nor Vercel AI Gateway is called.

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

The malformed customer-story dialog has been restored. UI tests now assert all page errors and cover opening, zooming, navigation and filters for all 18 existing screenshots. Live verification must confirm `mode: ai`, current plan price, a plan link, and the expected production deployment before reporting AI as active.


Knowledge expansion: the assistant consumes the same per-plan `product-features.js` resolver as the plan pages, including credits, activation/account type, gifts, notes, limits and deadline/availability information. The full 80-service directory carries verified starting prices and use summaries. `lib/store-help.cjs` supplies 34 guidance topics grounded in the existing customer flows and policy. Payment methods are read from `payment-assets.js`; current quantity-discount rates are fetched read-only from `master_store_discount_rules` alongside the plan snapshot. Missing snapshots never produce guessed prices or discount percentages. Arabic aliases, follow-up context, use-case matching and EGP budgets improve retrieval; recommendations honor verified availability and budget. No private customer records or conversations are ingested.
