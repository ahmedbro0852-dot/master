# MASTER STORE code desk

Independent customer request portal with private order tracking and manual code delivery. No upstream scraping, no source name in customer UI.

Configure ADMIN_PASSWORD (18+ characters), DATA_SECRET (28+ characters), DATA_FILE=/data/requests.json. Attach persistent volume at /data.

Customers enter their order reference, not third-party mailbox credentials. Admin interface at /admin requires password. Codes expire after 20 minutes. Automated retrieval requires permissioned vendor integration.
