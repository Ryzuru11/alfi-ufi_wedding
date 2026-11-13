import {
  completeDriveAuthorization,
  createDriveAuthorizationUrl,
  verifyDriveConnection,
} from '../services/googleDriveService.js'

export function startDriveAuthorization(_req, res, next) {
  try {
    res.redirect(createDriveAuthorizationUrl())
  } catch (error) {
    next(error)
  }
}

export async function finishDriveAuthorization(req, res, next) {
  try {
    if (req.query.error) {
      return res.status(400).send('Google Drive authorization was cancelled. You can close this page.')
    }
    if (typeof req.query.code !== 'string' || typeof req.query.state !== 'string') {
      return res.status(400).send('Google authorization response is incomplete. Start again at /api/drive/auth.')
    }
    await completeDriveAuthorization(req.query.code, req.query.state)
    res.send('Google Drive berhasil terhubung. Kamu bisa menutup halaman ini dan kembali ke website.')
  } catch (error) {
    next(error)
  }
}

export async function checkDriveConnection(_req, res, next) {
  try {
    const folder = await verifyDriveConnection()
    res.json({ status: 'ok', folder })
  } catch (error) {
    next(error)
  }
}
