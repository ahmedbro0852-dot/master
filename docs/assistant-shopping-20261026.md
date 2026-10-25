# Shopping assistant upgrade

- Carry the most recent EGP budget through follow-up questions; a new use or currency can reset the previous budget. Switch retrieval to a newly stated use instead of retaining unrelated products.
- Include the currently selected product tier in server context, validated against the catalogue. Client plan indexes do not supply prices or authorize any action.
- Compute up to three candidate plans from current available, nonhidden, nonexpired, valid server price rows. Respect budget, diversify products when relevant, disclose term/warranty/credits, and return exact plan links. Missing live prices produce no recommendation cards. Catalogue fallback respects recommendation constraints as well.
- Render compact, safe plan cards with EGP amounts and a final-cart-total note. Add context questions on product pages and follow-up questions after a reply.
- Add Stop response and Retry; ignore cancelled late responses and preserve one conversation turn when retrying. Chats remain in memory; no customer/order/account tools or extra persistence added. Provider, model, server-only key and token limits remain unchanged.

Validation: build and npm test, shopping-context tests, original assistant UI tests and upgraded UI tests (selected tier, cancel/retry, stale-response suppression, safe cards, English/dark mode, mobile/desktop). No real orders or payments are created by verification. Stop controls the browser response; it does not guarantee provider compute/billing cancellation.
