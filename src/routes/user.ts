import { Router } from 'express'
import { UserController } from '../modules/user/user.controller'
import { validateAuth } from '../validators/validateAuth'
import {
  createUserValidation,
  editUserValidation,
  userRoleValidation,
} from '../validators/userValidator'
import { privateRoute } from '../config/passport'
import { UserRoleController } from '../modules/userRole/userRole.controller'
import { authRole } from '../middlewares/role'
import { authUser } from '../middlewares/user'
import multer from 'multer'

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    const allowed: string[] = ['image/jpg', 'image/jpeg', 'image/png']
    cb(null, allowed.includes(file.mimetype))
  },
  limits: { fileSize: 2000000 },
})

const userRoutes = Router()
const userController = new UserController()
const userRoleController = new UserRoleController()

userRoutes.get('/:id', privateRoute, authUser, userController.get)
userRoutes.post(
  '/',
  upload.single('avatar'),
  createUserValidation,
  validateAuth,
  userController.create,
)
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
