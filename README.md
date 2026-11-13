# Everafter — Wedding Photo Sharing

Starter project for a modern wedding guest photo booth and shared gallery.

## Stack
- Frontend: React, Vite, Tailwind CSS, Framer Motion, Lucide
- Backend: Node.js, Express, Multer, Google Drive API

## Requirements
- Node.js 20 or newer
- npm

## Install
From the project root:

```bash
npm run install:all
```

## Google Drive setup
For a personal Gmail account, connect Drive using OAuth (a service account cannot upload to a personal My Drive because it has no storage quota):
1. In Google Cloud Console, enable the Google Drive API in the app's project.
2. Set up Google Auth Platform consent/branding. For an External app in Testing, add the Gmail account that owns the Drive folder as a test user.
3. Create an OAuth Client ID of type **Web application** and add `http://localhost:3000/api/drive/callback` as an authorized redirect URI.
4. Put the OAuth Client ID and Client Secret in `server/.env` as `GOOGLE_OAUTH_CLIENT_ID` and `GOOGLE_OAUTH_CLIENT_SECRET`. Set `GOOGLE_DRIVE_FOLDER_ID` to the ID of the destination folder owned by the account you will authorize. Keep all credentials on the server and do not commit them.
5. Run `npm run dev`, open `http://localhost:3000/api/drive/auth`, and sign in to the Google account that owns the folder. After consent, the page confirms the connection. Check `http://localhost:3000/api/drive/health`.

The OAuth refresh token is stored locally in the ignored file `server/.google-drive-oauth-token.json`. The backend uploads guest photos to the configured folder and serves gallery images through the API, so files do not need public Drive sharing. The gallery is visible to anyone who can reach the website.

## Free deployment: Vercel + Render
1. Deploy the `client` folder from this repository to Vercel (set the project Root Directory to `client`).
2. Deploy the API to Render using the repository's `render.yaml` Blueprint. Render will prompt for environment variables. Set `CLIENT_ORIGIN` to the final Vercel URL, set the Drive folder ID and OAuth client ID/secret, and set `GOOGLE_OAUTH_REDIRECT_URI` to `https://YOUR-RENDER-SERVICE.onrender.com/api/drive/callback`.
3. In Google Auth Platform > Clients, add that Render callback URL to the same OAuth web client as an authorized redirect URI.
4. On your computer, copy the existing OAuth refresh token with `((Get-Content server\.google-drive-oauth-token.json -Raw | ConvertFrom-Json).refresh_token)` and paste it directly into Render's `GOOGLE_OAUTH_REFRESH_TOKEN` environment variable. Do not send it in chat or commit it. The API can use this environment variable without relying on Render's temporary filesystem.
5. In Vercel Project Settings > Environment Variables, set `VITE_API_URL` to `https://YOUR-RENDER-SERVICE.onrender.com`, then redeploy the frontend.
6. Test the Render `/api/health` and `/api/drive/health` endpoints, then upload a photo from the Vercel site and check its gallery.

The free Render service may sleep when idle and take a short time to wake; this is expected on the free plan. During Google OAuth app Testing, refresh tokens can expire after seven days, so reauthorize and update the Render environment variable if that happens. Public guest access requires using the deployed HTTPS site, not localhost.

Each browser currently has a five-photo limit stored in localStorage. It is a UI convenience, not server-enforced quota; guests can reset it. The API accepts JPG, PNG, and WEBP photos up to 8 MB.

## Run
```bash
npm run dev
```

Frontend: http://localhost:5173
Backend health: http://localhost:3000/api/health

## Current status
- [x] Premium responsive welcome page
- [x] Navigation and page structure
- [x] Camera capture, preview, and upload flow
- [x] Google Drive upload and live guest gallery
- [x] Thank-you page
- [x] Express API, upload, and gallery routes
- [ ] Server-side guest session and photo quota
- [ ] Admin/reset flow for a new guest

## Customization
Edit the couple names, date, and location in `client/src/App.jsx`.
