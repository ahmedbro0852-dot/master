# MASTER STORE accounts and wallet

The store uses isolated `master_store_*` tables on the existing connected Supabase project. It does not read other applications' customer tables. Authentication is managed by Supabase; the browser receives only its publishable key. The pinned browser SDK is Supabase JS 2.102.0.

## Activation settings

In Supabase Authentication > URL Configuration, **add** `https://master-pi-six.vercel.app/account.html` to the redirect allowlist. Preserve other applications' URLs and the existing Site URL. Configure production SMTP for confirmation and recovery emails; the default email sender is restricted and unsuitable for public registration. Keep email confirmation enabled.

Google sign-in requires a Google Cloud OAuth web client and the Supabase provider callback `https://gmysuhoebcapigdidnnv.supabase.co/auth/v1/callback`. Register the store origin, configure client credentials directly in Supabase (never commit them), and enable Google. The account page displays Google only when the provider is enabled.

The connected GitHub owner email, `ahmedbro0852@gmail.com`, receives store administration only after Supabase confirms that email and a store profile is created. User-supplied metadata cannot grant this permission. A verified owner sees the management section in the account page.

## Funding and purchasing

Customers first ask support for payment instructions, transfer funds, and submit the amount, provider and transfer reference. This creates a **pending** top-up and never credits the wallet. The customer sends proof to support through the explicit WhatsApp link. An administrator verifies the transfer in the payment provider and then approves or rejects it in the management section. Approval creates one ledger entry and credits the account atomically.

Wallet checkout uses an authoritative server quote in EGP. Financial amounts are integer piastres; quantity, availability and sufficient balance are validated by the database. The customer explicitly selects wallet payment and confirms the order. Order creation and debit are one transaction. Cancelling an unfulfilled wallet order refunds it once. Completed orders cannot be silently cancelled. Bank/provider webhooks are not configured; credits require review.

Guest orders remain browser-local and use the existing WhatsApp checkout. Guest history is not silently imported as paid orders. Account purchases and wallet history are stored server-side and protected by RLS.

## Catalogue changes and checks

After a price or availability edit, run `node db/sync-store-prices.js` and apply the generated SQL with Supabase. Wallet prices use approved `plan.price` EGP amounts, not untrusted browser FX conversion. Checkout shows that canonical amount before confirmation.

Run `tests/wallet_security.sql` in a transaction. It tests cross-user isolation, blocked self-credit/role escalation, pending funding, price tampering, insufficient balance and idempotent approval, debit and refund. Every fixture is rolled back; no real funds are involved.

Quantity cart (2026-10-10):
- 2 units: 3%; 3: 5%; 4: 7%; 5+: 10%. Same plan and mixed plans count alike.
- Server merges duplicate lines, enforces per-plan quantity and availability, quotes canonical EGP prices, rounds discount per line to piastres.
- Authenticated checkout atomically creates all orders and debits the wallet once. Retry UUID prevents duplicate purchases. Cancellation refunds only the discounted line amount.
- Guests prepare an itemized WhatsApp request, with no wallet debit. Transfer confirmation remains manual.
- GitHub OAuth UI is included but disabled until the Supabase provider is enabled. Create a GitHub OAuth application with homepage https://master-pi-six.vercel.app and callback https://gmysuhoebcapigdidnnv.supabase.co/auth/v1/callback. Set its Client ID and secret directly in Supabase GitHub provider settings; allow redirect https://master-pi-six.vercel.app/account.html. Never put OAuth secrets in frontend code.
- Regression suites tests/cart_security.sql and tests/wallet_security.sql run in rollback transactions.

Manual admin dashboard (2026-10-10):
- /admin.html checks the authenticated user and trusted master_store_admins membership on every RPC.
- Account owners with administrator membership see a link from their account page. The owner bootstrap requires the verified owner email; profile metadata never grants roles.
- Six sections: orders, top-ups, plans/prices/availability/quantity limits, quantity discount rates, customers/wallet adjustments, and audit history.
- Manual plan edits set admin_overridden and use updated_at conflict checks. db/sync-store-prices.js preserves these overrides on future catalogue syncs.
- Homepage/product pages fetch public plan availability and manual prices; cart quotations and purchase amounts are always server-authoritative.
- Adjustments require a reason and confirmation, are idempotent, cannot make a wallet negative, and appear in the customer ledger. No service-role key is in the browser.
- Lists show latest 500 orders, top-ups and store customers; audit shows latest 100 changes. Summary counts cover all orders.
- Tests/admin_security.sql verifies administrator authorization, metadata impersonation rejection, manual pricing, dynamic discounts, stale-edit rejection, wallet adjustment idempotency, audit privacy, and net-price refunds. All test fixtures roll back.
