# MASTER STORE – Direct Facebook Page publishing bridge

This is a **disabled-by-default** server-side bridge for publishing an image + Arabic caption directly to the official MASTER STORE Facebook Page via Meta Graph API. It does not use Metricool's free publishing quota.

**Scope:** the new route publishes a provided photo and caption. It does not automatically design new posters or maintain a daily publishing calendar yet. Keep the existing Metricool daily automation in place until the Meta connection is configured and verified. Then disable the Metricool automation to prevent duplicate posts.

## Connect Meta securely

1. Go to https://developers.facebook.com/ and create or select a Meta developer business app associated with your authorized Page. Set up Facebook Login if needed.
2. Obtain a **Page access token**, not your Facebook password or a personal profile token. The authorizing person must have the Page **CREATE_CONTENT** task; request `pages_manage_posts`, `pages_read_engagement` and `pages_show_list`. Depending on your app, Meta may require app review or Advanced Access. See https://developers.facebook.com/docs/graph-api/reference/page/feed/.
3. On Vercel, open **Project master → Settings → Environment Variables → Production** and enter:
   - `META_PAGE_ID`: the Facebook Page's numeric ID, verified in Meta.
   - `META_PAGE_ACCESS_TOKEN`: secret Page token. Never paste this token into ChatGPT, GitHub, client-side JavaScript, or a public screenshot.
   - `META_PUBLISH_SECRET`: a separate random strong secret, at least 24 characters, for server-to-server calls.
4. Redeploy the production build to activate the environment configuration.
5. From a secure server, call POST `https://master-pi-six.vercel.app/api/meta-publish` with header `Authorization: Bearer <META_PUBLISH_SECRET>` and JSON `{ "message": "Full caption with website and WhatsApp links", "imageUrl": "https://static.metricool.com/planner/202611/photo.png", "dryRun": true }`. This validates data and configuration but does not post.
6. After checking the caption and image, omit `dryRun` to publish. A successful response contains `postId` and `postUrl`; verify the live Facebook post.

## Security and limitations

- No publishing without the private server-to-server secret. Method is POST-only.
- Caption and a publicly hosted HTTPS image are required together. The URL must be on `static.metricool.com` or `master-pi-six.vercel.app`; no plain text posts.
- The bridge checks the latest 50 Page posts for a caption with an exact match. This helps prevent duplicate requests but is not a fully durable idempotency system.
- No access tokens in the source code, static assets, or response.
- This bridge cannot function until the owner completes Meta authorization and securely configures Vercel environment variables.
- A future daily system needs a protected content queue, durable post records, and a single scheduler. Do not run it alongside an existing Metricool scheduler without coordination.

## Test

Run `node tests/meta-publish.test.cjs` from the repository root; the tests mock Meta and do **not** post to Facebook.
