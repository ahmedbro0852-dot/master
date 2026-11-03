# Master Store — independent design preview

This branch stores an independent, static design prototype. Do not merge it into main.

- Preview: https://master-design-lab.vercel.app/
- Mobile frame: https://master-design-lab.vercel.app/mobile.html
- Source snapshot: 0f0e2f07976923e103498ce4bbea72e0b70cfe35
- Catalogue: 101 services, source snapshot dated 3 November 2026.
- No customer records, credentials, APIs, live payments, real orders, or external connections.
- Cart and favourites use the browser-only master_design_lab_20261103 storage key.
- The root vercel.json has an ignoreCommand guard on this branch only, to skip the existing store’s Git builds.
- The separate master-design-lab project serves only the files in design-preview.

The primary store and main branch are unchanged.
