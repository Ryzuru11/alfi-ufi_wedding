import {
  completeDriveAuthorization,
  createDriveAuthorizationUrl,
  verifyDriveConnection,
} from '../services/googleDriveService.js'

export function startDriveAuthorization(_req, res, next) {
  try {
    if (process.env.VERCEL) {
      return res.status(404).send('Untuk menghubungkan Google Drive di Vercel, lakukan otorisasi dari komputer lokal lalu simpan refresh token di environment variable Vercel.')
    }
    const { state, url } = createDriveAuthorizationUrl()
    res.cookie('drive_oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 10 * 60 * 1000,
      path: '/api/drive',
    })
    res.redirect(url)
  } catch (error) {
    next(error)
  }
}

export async function finishDriveAuthorization(req, res, next) {
  try {
    if (process.env.VERCEL) {
      return res.status(404).send('Google Drive OAuth harus dijalankan dari komputer lokal.')
    }
    if (req.query.error) {
      res.clearCookie('drive_oauth_state', { path: '/api/drive' })
      return res.status(400).send('Google Drive authorization was cancelled. You can close this page.')
    }
    if (typeof req.query.code !== 'string' || typeof req.query.state !== 'string') {
      return res.status(400).send('Google authorization response is incomplete. Start again at /api/drive/auth.')
    }
    const stateCookie = (req.headers.cookie || '')
      .split(';')
      .map((cookie) => cookie.trim())
      .find((cookie) => cookie.startsWith('drive_oauth_state='))
      ?.slice('drive_oauth_state='.length)
    res.clearCookie('drive_oauth_state', { path: '/api/drive' })
    await completeDriveAuthorization(req.query.code, req.query.state, stateCookie)
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
