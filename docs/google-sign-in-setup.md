# Google sign-in setup

The application already uses Supabase Auth OAuth. Google is currently disabled in the live project's public settings; enabling the UI alone cannot enable OAuth.

1. In Google Cloud / Google Auth Platform, create a Web application OAuth client. Configure the audience for the intended users and the basic openid, email and profile scopes.
2. Authorized JavaScript origin: `https://master-pi-six.vercel.app`.
3. Authorized redirect URI: `https://gmysuhoebcapigdidnnv.supabase.co/auth/v1/callback`.
4. In Supabase project `gmysuhoebcapigdidnnv`, Authentication > Sign In / Providers > Google, enter Client ID and Client Secret directly in the dashboard and enable Google. Never commit the secret or paste it into chat.
5. Under Authentication > URL Configuration, allow `https://master-pi-six.vercel.app/account.html` and configure the production Site URL.
6. Refresh account.html. The Google button becomes enabled automatically when the provider is enabled. Test signup and returning-user sign-in with an actual Google account.
7. Store administration remains restricted to master_store_admins; Google sign-in does not grant administration to ordinary users. The preconfigured owner-email bootstrap still requires a confirmed email.

Provider setup: https://supabase.com/docs/guides/auth/social-login/auth-google
