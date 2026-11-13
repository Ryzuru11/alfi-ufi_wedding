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

The OAuth refresh token is stored in the ignored file `server/.google-drive-oauth-token.json`. The backend uploads guest photos to the configured folder and serves gallery images through the API, so files do not need public Drive sharing. The gallery is visible to anyone who can reach the website. During OAuth app Testing, Google can expire refresh tokens after seven days; for long-term use, publish the consent app in Google Auth Platform. Deployment to guests requires public HTTPS frontend/backend URLs and a production OAuth redirect URI.

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
