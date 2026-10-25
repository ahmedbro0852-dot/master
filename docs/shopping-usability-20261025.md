# Shopping usability improvements

- Product selection updates the current URL. Copy plan link produces a direct generated product URL with the selected plan index. Clipboard denial falls back to a selectable read-only URL field.
- Ask about this plan opens the existing assistant with a draft naming the exact product and plan. No API request is made until Send. Escape/close returns focus to the initiating control; reopening the general launcher preserves an unsent draft.
- Cart product links retain plan_index rather than returning to the default plan.
- Cart contact fields and selected payment method stay in memory during quantity/locale re-quotes, with authoritative server totals and valid wallet availability. Drafts are not newly persisted. Payment falls back to an eligible choice when the former choice is unavailable.
- Contact fields use name/email/tel autocomplete and mobile phone keyboard hints.

Validation: build and unit/knowledge/SEO suite; shopping-usability browser test for copy/manual fallback, selected-plan reload, contextual AI request contract/focus, responsive Arabic/English controls, cart quote/draft/link flow; existing site-improvements and assistant UI tests. Mock AI and quote responses only in local tests; no real orders or payments submitted. Verify publication and public browser flows after deployment.
