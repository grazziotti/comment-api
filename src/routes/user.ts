import { Router } from 'express'
import { UserController } from '@/modules/user/user.controller'
import { validateAuth } from '@/validators/validateAuth'
import { createUserValidation } from '@/validators/userValidator'

const userRoutes = Router()
const userController = new UserController()

userRoutes.post('/', createUserValidation, validateAuth, userController.create)

export default userRoutes
