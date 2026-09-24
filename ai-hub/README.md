# Nasha

Nasha is a focused web workspace for documents, design, video, audio, translation, and files.

## Project contents

- `index.html` — marketing site and workspace UI
- `styles.css` — full responsive design system
- `app.js` — navigation, editor autosave, recent work, file selection, settings, slider, mobile menu, and UI interactions
- `nasha-mark.svg` — Nasha brand mark
- `vercel.json` — standalone deployment/security headers for the Nasha folder

## Run locally

Nasha is a static project. You can serve this folder with any static server.

Example:

```bash
python3 -m http.server 8080
```

Then open:

```
http://localhost:8080
```

## Deploy

### Vercel

Create a new Vercel project from this repository and set the project Root Directory to:

```
ai-hub
```

No build command is required for the current static version.

### Other static hosts

The folder can also be deployed to Netlify, Cloudflare Pages, GitHub Pages, or any standard static web host.

## Current product state

Implemented:
- Responsive marketing site
- Home hero slider
- Editorial content sections
- Workspace dashboard
- Documents editor
- Local autosave
- Recent work
- Design studio UI
- Video studio UI
- Audio workspace UI
- Translation workspace UI
- File selection and drag/drop UI
- Settings drawer
- Privacy/Terms preview
- Mobile navigation
- Lucide icon library
- Google Fonts
- Unsplash photography

Intentionally not connected yet:
- Live generation/services
- Server-side APIs
- Authentication
- Cloud persistence
- Billing

API keys must be added server-side only when live services are connected. Never place provider keys in `app.js` or other browser code.

## Brand palette

- Green: `#0F6B50`
- Dark green: `#0A4F3B`
- Yellow: `#F3C94D`
- Blue: `#2F6FE4`
- White: `#FFFFFF`
- Ink: `#10231D`

## External resources

- Lucide icons: pinned CDN version
- Google Fonts: Inter, Inter Tight, Noto Sans Arabic
- Unsplash photography

## Notes

The existing repository also contains Master Store at the repository root. Nasha is isolated inside `ai-hub/` and should remain separate from the root store.
