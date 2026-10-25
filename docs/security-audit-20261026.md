# Master Store security hardening — 26 October 2026

## Implemented

- Build a dedicated `_site` output using an explicit root-file manifest and allowlisted asset directories. Source helpers, SQL/migrations, tests, documentation, package/configuration files, API source and the separate AI Hub are absent from static hosting. Frontend code and the public catalogue remain public by design. API function dependencies stay in the source and are bundled separately by Vercel.
- Update the existing Pages publishing workflow to publish the same public output rather than the entire repository, and pin the existing checkout major to a reviewed immutable commit. Source files may still be visible to authorized GitHub repository readers; this is deployment isolation, not encryption of source history.
- Retire the unrelated Nasha chat/status routes on the Master Store deployment using a nonsecret MASTER_STORE_SITE deployment flag and early runtime rejection, since filesystem function routes take priority over simple rewrites. The separate `ai-hub/vercel.json` is unchanged.
- Tighten CSP to local scripts only; the store already uses a local versioned Supabase client. Preserve HTTPS/HSTS, framing restrictions, no-sniff, policy restrictions and private-page no-store headers.
- Assistant API: require matching Origin, reject cross-site Fetch Metadata, enforce an exact JSON media type and a narrow body/message schema, validate product/tier/language inputs and measure the complete UTF-8 request body independently of Content-Length. Invalid requests return before any upstream request.
- Bound simultaneous assistant work to 2 requests per IP and 32 per function instance, with a 10/minute per-instance IP window and bounded counters. Release leases on every exit. Only Vercel deployment headers are trusted for forwarded IPs; local servers use the socket. Counters are process-local and are not a global spending cap or distributed DDoS guarantee. Origin checks are browser abuse controls, not authentication against a caller able to forge headers.

## Database/auth review

All 11 store tables and both CRM tables inspected have RLS enabled. Private financial tables grant no anonymous access; signed-in read policies bind ownership or verified store-admin membership. Direct wallet/order/price writes are not granted to customers. Admin functions check the admin table instead of editable user metadata. The owner bootstrap requires a confirmed email. Public RPC wrappers use invoker security and private implementations have an empty search path and explicit guards. No database schema, roles, balances, orders or auth-provider settings were changed.

A read-only transaction using a non-existent authenticated subject returned no orders, wallets or CRM records and raised ADMIN_REQUIRED for the admin snapshot. The transaction was rolled back. Unrelated advisory findings for other applications sharing the project were not modified.

## Verification and remaining controls

Build, npm tests, isolated-output/CSP browser smoke (search, locale, dark mode, purchase-to-cart quotes and signup UI), rate/concurrency/input tests and a Pages publication-index reproduction pass. Real checkout/payment submission is not used for verification. Check production for 404 on internal paths/retired endpoints, security headers, rejected invalid requests, and one legitimate assistant request after deployment.

Supabase still reports leaked-password protection disabled. The official feature requires Pro or higher: https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection . No plan upgrade, paid feature, account-wide change, forced logout or MFA enrollment was performed. Custom WAF configuration was not changed; distributed rate limiting remains a separate improvement. These changes reduce identified attack surface and do not establish that the site has no remaining vulnerabilities.
