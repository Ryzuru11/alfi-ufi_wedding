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

## Free deployment: Vercel only
Vercel can host both the frontend and the Express API as separate projects from this same GitHub repository. The frontend is a static Vite site; the backend runs as request-based Vercel Functions. The laptop does not need to stay on. Functions are not a continuously running background process, but they run when guests make requests.

1. Import this repository into Vercel and create the frontend project with Root Directory `client`.
2. In the frontend project's Settings > Environment Variables, add `VITE_API_URL` with the backend project's production URL (for example `https://alfi-ufi-wedding-api.vercel.app`). Redeploy the frontend after setting it.
3. Import the same GitHub repository again as a second Vercel project for the API, with Root Directory `server`. Vercel detects the exported Express app.
4. In the API project's Settings > Environment Variables, add `CLIENT_ORIGIN` (the exact production frontend URL), `GOOGLE_DRIVE_FOLDER_ID`, `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`, and `GOOGLE_OAUTH_REFRESH_TOKEN`. Do not add these secrets to GitHub.
5. To copy the already-authorized refresh token locally without displaying it in chat, run this in PowerShell from the repository root and paste the result directly into Vercel's `GOOGLE_OAUTH_REFRESH_TOKEN` value: `(Get-Content server\.google-drive-oauth-token.json -Raw | ConvertFrom-Json).refresh_token`.
6. Deploy both projects. Check the API project's `/api/health` and `/api/drive/health`, then try taking and uploading a photo from the production frontend.

Google Drive OAuth authorization is performed locally at `http://localhost:3000/api/drive/auth`; the production API does not expose an authorization callback because Vercel Functions do not provide persistent local token storage. If the Google Testing refresh token expires, reauthorize locally and update the Vercel environment variable. Vercel Functions are request-driven rather than a 24/7 process, and the laptop can be turned off. Guests must use the production HTTPS frontend, not localhost.

Each browser currently has a five-photo limit stored in localStorage. It is a UI convenience, not server-enforced quota; guests can reset it. Photos are compressed by the camera page before upload; the API accepts JPG, PNG, and WEBP images up to 4 MB.

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
