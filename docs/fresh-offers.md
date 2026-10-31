# Seven-day new-arrival and price-drop shelf

This homepage shelf is separate from cancelled poster advertising. It never resumes campaigns, generates posters, opens popups, or touches browser cooldowns.

`master_store_plans.launched_at` is stamped once on insertion. Legacy rows remain null; only eight verified October 31 additions were seeded from their insertion timestamps. `discounted_at` is stamped only when the actual price falls, cleared on increases or term/name changes, and preserved across stock/quantity/metadata updates. Two verified recent reductions are seeded from their release commits because older updated_at timestamps are not reliable price history.

The public shelf uses live price/availability and exact `?plan=` links. A new plan or genuine store-price reduction is shown from its timestamp up to (but excluding) timestamp + 168 hours. Hidden, redirected, missing, unavailable and expired plans are excluded. An older eligible launch can remain after its discount badge expires. The section hides when empty or the live fetch fails. It refreshes every minute/on tab return and checks expiry every second without rebuilding unchanged cards or disturbing keyboard focus. Translation and currency changes re-render the shelf. Former prices are actual store prices, never official reference prices.

Seven days is a discovery window, not a subscription duration, sale-price deadline or promise to restore an older price. Price changes still require the existing authorized catalogue/admin workflow. No cron or hourly automation is needed. Future source additions must also be inserted into the authoritative server catalogue, as before.

Verification: node tests/fresh-offers.test.cjs; npm test; npm run build. The discovery trigger was tested with a synthetic unavailable plan inside a rolled-back transaction (insert, decrease, metadata update, increase).

## Story presentation (approved November 1)
The shelf now uses compact service-logo story circles, grouped by product. Clicking opens a native modal dialog with live selected-tier price, actual former price, duration, account and warranty. It never opens automatically. Previous/next arrows, touch swipe, Escape, native focus containment and close-focus restoration are supported. An eight-second progress bar can be paused; reduced motion starts paused. Seen rings use a separate bounded local-storage key keyed by plan, event timestamp and price. Existing advertising cooldowns and paused campaign records stay untouched. Expired/unavailable stories are removed during viewing; an empty or failed live feed closes the viewer. All discovery deadlines are unchanged.
