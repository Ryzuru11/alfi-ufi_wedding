import { Router } from 'express'
import multer from 'multer'
import { uploadPhoto, listPhotos, showPhoto } from '../controllers/photoController.js'
const router = Router()
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 }, fileFilter: (_req, file, cb) => {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) return cb(Object.assign(new Error('Only JPG, PNG, and WEBP images are allowed'), { status: 400 }))
  cb(null, true)
} })
router.post('/upload', upload.single('photo'), uploadPhoto)
router.get('/gallery', listPhotos)
router.get('/:id/content', showPhoto)
export default router
