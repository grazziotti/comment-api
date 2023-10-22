import { Router } from 'express'
import { SessionController } from '@/modules/session/session.controller'

const sessionRoutes = Router()
const sessionController = new SessionController()

sessionRoutes.post('/', sessionController.create)

export default sessionRoutes
