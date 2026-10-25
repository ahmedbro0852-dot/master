# Storefront review — 2026-10-25

Reviewed the home, plan, account, cart, tracking and warranty pages using the existing catalogue and mocked public price snapshots. At 390px the mobile header previously measured 169px and the assistant overlapped the WhatsApp support button on plan pages. The shared layout reduces the header to 118px and separates both support controls from each other and the checkout bar.

Added canonical Facebook and the owner-supplied WhatsApp offers channel in `social-links.js`, a home follow section, footer links on all public templates and generated category/product pages, and both profile URLs in Organization structured data. Support chat remains a distinct destination. Shared CSS supports light/dark themes, Arabic/English and 320/390/768/1440 widths. The assistant uses and allows the exact configured profile links.

Search now handles Arabic service-name aliases, Arabic credit digits and matching words in any order. Search, category, availability and sort state can be shared in the page URL and restored on reload. Added a keyboard skip link, a back-to-top control, menu Escape/focus restoration and header-aware anchor spacing.

Verification: `npm test`; `tests/site-improvements.test.cjs`; customer-story, assistant UI, store-price-history, avatar, invoice and admin-session browser checks. The site test walks plan selection → add to cart → quote payload → EGP 270 checkout summary, using mocked responses and no real orders or payments. Read-only production checks follow deployment. Browser tests use Playwright and CHROMIUM_EXECUTABLE_PATH. Provider responses and public quote data should be tested without submitting an order. No private customer data is used.
