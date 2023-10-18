import { Router } from 'express'
import { UserController } from '@/modules/user/user.controller'

const userRoutes = Router()
const userController = new UserController()

userRoutes.post('/', userController.create)

export default userRoutes
