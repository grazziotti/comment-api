import { Router } from 'express'
import { SessionController } from '../modules/session/session.controller'
import { createUserValidation } from '../validators/userValidator'
import { validateAuth } from '../validators/validateAuth'

const sessionRoutes = Router()
const sessionController = new SessionController()

sessionRoutes.post(
  '/',
  createUserValidation,
  validateAuth,
  sessionController.create,
)

export default sessionRoutes
