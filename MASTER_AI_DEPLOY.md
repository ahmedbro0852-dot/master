# MASTER AI deployment

The storefront is static, while `/api/chat` is a server-side function so the Aerolink key never reaches the browser.

## Recommended deployment

Import this GitHub repository into Vercel and deploy the repository root.

Add these Environment Variables in the hosting dashboard:

- `AEROLINK_API_KEY` — your private Aerolink API key.
- `AEROLINK_BASE_URL` — `https://aerolink.lat`
- `AEROLINK_RESPONSES_PATH` — `/responses` (change this only if your Aerolink dashboard/documentation shows a different Responses path).
- `AEROLINK_MODEL` — the model route enabled for your Aerolink account.

After changing variables, redeploy.

## Security

- Never put the real API key in `index.html`, `app.js`, `ai-assistant.js`, `catalog.js`, or any public GitHub file.
- If a key has ever been pasted publicly or committed, revoke it and create a new one.
- The backend refuses unrelated topics before calling Aerolink.
- The assistant is instructed not to reveal supplier data, internal costs, secrets, or hidden configuration.
- Product facts come from the storefront catalog. Unknown facts must not be invented.

## GitHub Pages

The site still works on GitHub Pages using the built-in catalog assistant. GitHub Pages cannot execute `/api/chat`; deploy the repository on a serverless host to enable live Aerolink responses.
