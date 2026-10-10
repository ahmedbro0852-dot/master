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
