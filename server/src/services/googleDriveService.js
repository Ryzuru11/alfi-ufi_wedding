import { google } from 'googleapis'
import { randomBytes, randomUUID } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { Readable } from 'node:stream'

const tokenFile = fileURLToPath(new URL('../../.google-drive-oauth-token.json', import.meta.url))
const authorizationStates = new Map()

function getOAuthClient() {
  const { GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET } = process.env
  const missing = [
    ['GOOGLE_OAUTH_CLIENT_ID', GOOGLE_OAUTH_CLIENT_ID],
    ['GOOGLE_OAUTH_CLIENT_SECRET', GOOGLE_OAUTH_CLIENT_SECRET],
  ].filter(([, value]) => !value)

  if (missing.length) {
    throw new Error(`Missing Google OAuth configuration: ${missing.map(([name]) => name).join(', ')}`)
  }

  const redirectUri = process.env.GOOGLE_OAUTH_REDIRECT_URI || `http://localhost:${process.env.PORT || 3000}/api/drive/callback`
  return new google.auth.OAuth2(GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET, redirectUri)
}

async function getDriveClient() {
  const oauth2Client = getOAuthClient()
  let credentials
  try {
    credentials = JSON.parse(await readFile(tokenFile, 'utf8'))
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
    throw new Error('Google Drive belum terhubung. Buka /api/drive/auth untuk memberi izin.')
  }
  oauth2Client.setCredentials(credentials)
  oauth2Client.on('tokens', (tokens) => {
    const updatedCredentials = { ...credentials, ...tokens }
    writeFile(tokenFile, JSON.stringify(updatedCredentials), { mode: 0o600 })
      .catch((error) => console.error('Failed to save refreshed Google OAuth tokens:', error))
  })

  const { GOOGLE_DRIVE_FOLDER_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY } = process.env
  if (!GOOGLE_DRIVE_FOLDER_ID) {
    throw new Error('Missing Google Drive configuration: GOOGLE_DRIVE_FOLDER_ID')
  }

  return {
    drive: google.drive({ version: 'v3', auth: oauth2Client }),
    folderId: GOOGLE_DRIVE_FOLDER_ID,
  }
}

export function createDriveAuthorizationUrl() {
  const oauth2Client = getOAuthClient()
  const state = randomBytes(32).toString('hex')
  authorizationStates.set(state, Date.now() + 10 * 60 * 1000)
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: ['https://www.googleapis.com/auth/drive'],
    state,
  })
}

export async function completeDriveAuthorization(code, state) {
  const expiresAt = authorizationStates.get(state)
  authorizationStates.delete(state)
  if (!expiresAt || expiresAt < Date.now()) {
    throw new Error('Google authorization expired or is invalid. Restart at /api/drive/auth.')
  }

  const oauth2Client = getOAuthClient()
  const { tokens } = await oauth2Client.getToken(code)
  if (!tokens.refresh_token) {
    throw new Error('Google did not return a refresh token. Restart consent and grant Drive access.')
  }
  await writeFile(tokenFile, JSON.stringify(tokens), { mode: 0o600 })
  return tokens
}

export async function verifyDriveConnection() {
  const { drive, folderId } = await getDriveClient()
  const { data } = await drive.files.get({
    fileId: folderId,
    fields: 'id,name,mimeType',
    supportsAllDrives: true,
  })

  if (data.mimeType !== 'application/vnd.google-apps.folder') {
    throw new Error('GOOGLE_DRIVE_FOLDER_ID does not point to a Google Drive folder')
  }

  return { id: data.id, name: data.name }
}

export async function savePhotoToDrive(file) {
  const { drive, folderId } = await getDriveClient()
  const extension = file.mimetype.split('/')[1].replace('jpeg', 'jpg')
  let data
  try {
    const response = await drive.files.create({
      requestBody: {
        name: `${Date.now()}-${randomUUID()}.${extension}`,
        mimeType: file.mimetype,
        parents: [folderId],
      },
      media: {
        mimeType: file.mimetype,
        body: Readable.from(file.buffer),
      },
      fields: 'id,name,mimeType,createdTime',
      supportsAllDrives: true,
    })
    data = response.data
  } catch (error) {
    if (/storage quota|service accounts do not have storage|storage limit/i.test(error.message || '')) {
      const actionableError = new Error('Service Account tidak memiliki kuota penyimpanan. Gunakan folder di Google Workspace Shared Drive dan tambahkan Service Account sebagai Contributor.')
      actionableError.status = 503
      throw actionableError
    }
    throw error
  }

  return {
    id: data.id,
    name: data.name,
    mimeType: data.mimeType,
    createdTime: data.createdTime,
    imageUrl: `/api/photo/${encodeURIComponent(data.id)}/content`,
  }
}

export async function getGalleryPhotos(pageToken) {
  const { drive, folderId } = await getDriveClient()
  const { data } = await drive.files.list({
    q: `'${folderId}' in parents and trashed = false and mimeType contains 'image/'`,
    pageSize: 100,
    pageToken,
    orderBy: 'createdTime desc',
    fields: 'nextPageToken,files(id,name,mimeType,createdTime)',
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
  })

  return {
    photos: (data.files || []).map((file) => ({
      id: file.id,
      name: file.name,
      createdTime: file.createdTime,
      imageUrl: `/api/photo/${encodeURIComponent(file.id)}/content`,
    })),
    nextPageToken: data.nextPageToken || null,
  }
}

export async function getPhotoContent(fileId) {
  const { drive, folderId } = await getDriveClient()
  const { data: metadata } = await drive.files.get({
    fileId,
    fields: 'id,mimeType,parents',
    supportsAllDrives: true,
  })
  if (!metadata.parents?.includes(folderId) || !metadata.mimeType?.startsWith('image/')) {
    const error = new Error('Photo not found in the configured gallery')
    error.status = 404
    throw error
  }

  const { data, headers } = await drive.files.get(
    { fileId, alt: 'media', supportsAllDrives: true },
    { responseType: 'stream' },
  )

  return { stream: data, contentType: headers['content-type'] }
}
