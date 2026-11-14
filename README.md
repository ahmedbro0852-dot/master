# MASTER Flow Studio
Public Arabic code-access AI media studio. Vercel frontend/API; Supabase Postgres and private Storage.

Each promotional code starts with 30 US cents of internal promotional credit. At the catalog's current 2-cent Veo 3.1 720p price this buys 15 standard eight-second videos. All models use exact live provider cash prices. Promotional credits are not provider-funded credits or cash and do not guarantee supplier availability.

## Deploy
`npm ci && npm run build`. Node 24, Vercel API `api/studio.mjs`, output `public`.

Required server secrets: `ROYAL_API_KEY`, `FLOW_GATEWAY_SECRET`; configuration `FLOW_BACKEND_URL`. Never include these in browser code or source control.

Supabase schema is isolated under `master_flow`, RLS enabled with no browser access. The RPC is invoker-only and service-role only. Edge function verifies a SHA-256 digest of the gateway secret before calling it. Replace `GATEWAY_HASH` in the edge template when deploying through a trusted operator. No plaintext redemption codes are stored.

## Limits and accounting
One active generation per code, three globally. Atomic row locks and advisory locks enforce budgets and admission. Idempotent request UUIDs prevent duplicate charges. Provider-declared failure/cancellation refunds exactly once; ambiguous submission timeouts remain held for operator reconciliation rather than risking duplicate generation.

500 MiB of private archived results per code; 100 MiB per file; 5 GiB total application budget. Archives are copied on job status refresh after completion. Keep the page open or use refresh to complete archival. File retrieval validates code ownership and issues five-minute signed URLs. Sharing a redemption code grants its holder access to its balance and library.

Provider credentials are intentionally not pooled across trial accounts. The ten promotional wallets total $3 internal credit; supplier funding must independently cover all promised deliveries.
