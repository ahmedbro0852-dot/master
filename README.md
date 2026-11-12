# رمز — Code Inbox

## Try on GitHub Codespaces
Open this branch in a GitHub Codespace (Code → Codespaces → Create codespace on code-inbox-standalone).
Wait for setup and open port 3000 from the Ports panel. The port should stay private.
The server starts automatically; if needed run `npm start`.
Enter your inbox key in the website only. Do not commit keys, messages, screenshots, or browser sessions.

The browser runs in the Codespace, independently of Vercel. Source-provider restrictions still apply. No challenge bypass is implemented. Every request uses an isolated browser that closes afterward.
Codespaces may consume your GitHub included usage allowance. Stop the Codespace after testing.

## Local
Node 22, `npm install`, then `npm start`.
Set CHROME_EXECUTABLE_PATH to an installed Chrome/Chromium executable if needed.
