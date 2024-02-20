import { Router } from 'express'
import { UserController } from '@/modules/user/user.controller'
import { validateAuth } from '@/validators/validateAuth'
import {
  createUserValidation,
  editUserValidation,
  userRoleValidation,
} from '@/validators/userValidator'
import { privateRoute } from '@/config/passport'
import { UserRoleController } from '@/modules/userRole/userRole.controller'
import { authRole } from '@/middlewares/role'
import { authUser } from '@/middlewares/user'

const userRoutes = Router()
const userController = new UserController()
const userRoleController = new UserRoleController()

userRoutes.get('/:id', privateRoute, authUser, userController.get)
userRoutes.post('/', createUserValidation, validateAuth, userController.create)
userRoutes.post(
  '/acl',
  privateRoute,
  userRoleValidation,
  validateAuth,
  authRole,
  userRoleController.create,
)
userRoutes.put(
  '/:id',
  privateRoute,
  authUser,
  editUserValidation,
  validateAuth,
  userController.update,
)
userRoutes.delete('/:id', privateRoute, authUser, userController.delete)

export default userRoutes
