import { savePhotoToDrive, getGalleryPhotos, getPhotoContent } from '../services/googleDriveService.js'

export async function uploadPhoto(req, res, next) {
  try {
    if (!req.file) return res.status(400).json({ message: 'Photo file is required (field: photo)' })
    const result = await savePhotoToDrive(req.file)
    res.status(201).json({ message: 'Photo uploaded successfully', photo: result })
  } catch (error) { next(error) }
}
export async function listPhotos(req, res, next) {
  try {
    const result = await getGalleryPhotos(req.query.pageToken)
    res.json(result)
  } catch (error) { next(error) }
}

export async function showPhoto(req, res, next) {
  try {
    if (!/^[\w-]+$/.test(req.params.id)) {
      return res.status(400).json({ message: 'Invalid photo ID' })
    }
    const { stream, contentType } = await getPhotoContent(req.params.id)
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(contentType)) {
      stream.destroy()
      return res.status(415).json({ message: 'Unsupported image type' })
    }
    res.set('Content-Type', contentType)
    res.set('Cache-Control', 'private, max-age=300')
    stream.on('error', next)
    stream.pipe(res)
  } catch (error) { next(error) }
}
