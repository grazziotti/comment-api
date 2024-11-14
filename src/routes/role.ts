import { Router } from 'express'
import { RoleController } from '../modules/role/role.controller'
import { validateAuth } from '../validators/validateAuth'
import { createRoleValidation } from '../validators/roleValidator'
import { authRole } from '../middlewares/role'
import { privateRoute } from '../config/passport'

const roleRoutes = Router()
const roleController = new RoleController()

roleRoutes.post(
  '/',
  privateRoute,
  authRole,
  createRoleValidation,
  validateAuth,
  roleController.create,
)

roleRoutes.get('/:roleId', privateRoute, authRole, roleController.get)

export default roleRoutes
