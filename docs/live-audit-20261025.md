# Live storefront audit — 2026-10-25

Read-only public crawl: all 88 sitemap URLs returned HTTP 200 with titles, descriptions and canonical URLs. Product assets use `<base href="/">`; resolving that base eliminated the crawler's initial false-positive `/products/*.js` requests. Correctly resolved local assets returned HTTP 200. Public runtime-error clusters were empty for the preceding hour.

A real Chromium session against production exposed a malformed closing `option/select` sequence in the home price-sort control: product-card markup was not displayed correctly. Comparison with the tested pre-upload source isolated missing characters in published `index.html` and `warranty.html`. The upload reader had mixed JavaScript UTF-16 lengths with Python codepoint offsets across emoji-containing chunks. Future uploads must use base64 blobs and verify the returned Git blob SHA against the local file's hash. Source-file checks alone cannot detect this publication failure; verify the live browser after release.

Restored the full sort markup and English policy clauses 8–9. Fixed locale refresh to keep the account/wallet CTA consistent with its destination, preserve the actual catalogue service count, and describe warranty per plan rather than claiming full coverage for every service. Commercial terms and prices are unchanged.

Regression: `tests/storefront-integrity.test.cjs` covers all 80 cards outside the sort control, three sorting choices, Arabic/English account labels, dynamic count after translation refresh, truthful warranty copy, 60 complete policy clauses, the generated CapCut plan page and local assets. Deployment uploads use byte-safe base64 blobs with hash checks; production verification follows publication. No order, payment or customer-account mutation is used.
