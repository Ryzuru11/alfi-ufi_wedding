import { Router } from 'express'
import {
  checkDriveConnection,
  finishDriveAuthorization,
  startDriveAuthorization,
} from '../controllers/driveController.js'

const router = Router()
router.get('/auth', startDriveAuthorization)
router.get('/callback', finishDriveAuthorization)
router.get('/health', checkDriveConnection)

export default router
