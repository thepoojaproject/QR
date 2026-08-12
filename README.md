# Neelam QR Generator APK
GitHub-ready Android WebView wrapper for the QR generator.

## Login
Username: `Neelam`
Password: `Neelam143`

## Build APK on GitHub
1. Create a new GitHub repository.
2. Upload all files from this folder.
3. Open **Actions** and run **Build Android APK** (or push to `main`).
4. Open the completed workflow run → **Artifacts** → download `Neelam-QR-Generator-APK`.

## Important: secure ImgBB configuration
The original project had the ImgBB API key directly in browser JavaScript. This version removes that key from the client. The web app calls `/api/imgbb-upload`.

For a real hosted deployment, implement `/api/imgbb-upload` as a server/serverless function and store `IMGBB_API_KEY` as a GitHub/hosting secret or environment variable. Do not put the key into `index.html` or the Android APK.

## Secure ImgBB API setup (Vercel)

The ImgBB secret is **not stored in `index.html` or the APK**.

1. Import this repository into Vercel.
2. In Vercel → Project → Settings → Environment Variables, add:
   - Name: `IMGBB_API_KEY`
   - Value: your ImgBB API key
   - Environments: Production (and Preview if needed)
3. Redeploy.
4. Copy your Vercel project URL, for example `https://your-project.vercel.app`.
5. For the Android APK, set the API base URL in the app's browser local storage if you expose a settings screen, or replace `API_BASE_URL` in `index.html` with your Vercel URL **without adding the secret** and rebuild.
6. Never commit `.env`, the real API key, or the old client-side key.

### Recommended GitHub secret
Keep the ImgBB key out of GitHub source. If you use GitHub Actions for deployments, store it under:
`Settings → Secrets and variables → Actions`.
