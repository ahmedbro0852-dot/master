# Lovable Pro Lite 48-hour offer

Existing Lovable Pro plan 3 (legacy lovable-lite plan 0) costs EGP 430 instead of the verified previous EGP 450. One year, 300 total credits plus 5 daily, personal-email activation and existing full warranty. No other plans or currencies are edited.

Ends 2026-10-28 05:15 UTC / 08:15 Africa/Cairo. A guarded pg_cron job checks once per minute, restores EGP 450, then unschedules itself. It only updates the two offer rows if their price is still 430 and the campaign override remains enabled; later different admin prices are preserved. Browser pricing also expires on already-open pages and offline catalogue fallbacks; the assistant checks the deadline on each request. Cron can take up to one minute to restore server checkout prices. No customer, order, balance, auth or schema changes.

Validation: build and npm test; deadline/offline/open-tab regressions; public output browser smoke with Arabic/English yearly offer, previous price, 320/390/1440 widths and existing cart/signup flows. Read-only real quote confirms 43000 piastres; transaction with rollback checks promotional and restored server prices. No orders submitted.
