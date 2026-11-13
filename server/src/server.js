import 'dotenv/config'
import express from 'express'
import multer from 'multer'
import cors from 'cors'
import helmet from 'helmet'
import photoRoutes from './routes/photoRoutes.js'
import driveRoutes from './routes/driveRoutes.js'

const app = express()
app.use(helmet())
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }))
app.use(express.json())
app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'wedding-photo-sharing-api' }))
app.use('/api/photo', photoRoutes)
app.use('/api/drive', driveRoutes)
app.use((err, _req, res, _next) => {
  console.error(err)
  if (res.headersSent) return
  const status = err.status || (err instanceof multer.MulterError
    ? err.code === 'LIMIT_FILE_SIZE' ? 413 : 400
    : 500)
  res.status(status).json({ message: err.message || 'Internal server error' })
})
const port = Number(process.env.PORT || 3000)
app.listen(port, () => console.log(`Wedding API running at http://localhost:${port}`))
