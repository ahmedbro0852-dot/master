# Compare subscription plans

Added an on-demand native dialog for products with two or more visible plans. Customers compare up to three plans using catalogue prices, full terms, credit/word allowances, account method, activation and warranty. Missing allowances are explicitly unspecified; service capabilities and quotas are never borrowed from another tier. Selecting an available plan updates the existing radio selection, price, URL and focus. Hidden plans are excluded; unavailable plans cannot be selected.

Two-plan comparisons fit mobile screens side by side. Three-plan comparisons scroll inside the table, with the row-label column fixed. The controls support Arabic/English, themes, keyboard focus and Escape. Single-plan products omit the comparison control.

Also fixed locale refresh to match plan rows by the actual radio value rather than their visible position when a previous plan is hidden. Added precise English translations for existing CapCut plan names, credit qualifications and delivery terms, preserving ready-account vs personal-email activation and full vs limited warranty wording.

Validation: build, unit/knowledge/SEO checks, plan-comparison browser test at 320/390/768/1440 including dark mode, selection/URL/focus, tier-specific allowances, unknown quotas, three-plan limit, unavailable/hidden plans, and single-plan omission; existing shopping-usability and storefront integrity regression tests. No price, subscription SKU or checkout/API provider changes.
