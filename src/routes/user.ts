import { Router } from 'express'
import { UserController } from '@/modules/user/user.controller'
import { validateAuth } from '@/validators/validateAuth'
import {
  createUserValidation,
  editUserValidation,
} from '@/validators/userValidator'
import { privateRoute } from '@/config/passport'

const userRoutes = Router()
const userController = new UserController()

userRoutes.get('/', privateRoute, userController.get)
userRoutes.post('/', createUserValidation, validateAuth, userController.create)
userRoutes.put(
  '/',
  privateRoute,
  editUserValidation,
  validateAuth,
  userController.update,
)
userRoutes.delete('/', privateRoute, userController.delete)

export default userRoutes
