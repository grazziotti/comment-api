import { RolePrismaRepository } from '@/modules/role/repositories/RolePrismaRepository'
import { FindRoleByIdService } from '@/modules/role/role.findById.service'
import { UserSave } from '@/modules/user/repositories/IUserRepository'
import { UserRolePrismaRepository } from '@/modules/userRole/repositories/UserRolePrismaRepository'
import { GetUserRolesService } from '@/modules/userRole/userRole.getUserRoles.service'
import { NextFunction, Request, Response } from 'express'

const authUser = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  const user = request.user as UserSave
  const { id } = request.params

  const userRolePrismaRepository = new UserRolePrismaRepository()
  const rolePrismaRepository = new RolePrismaRepository()
  const findRoleByIdService = new FindRoleByIdService(rolePrismaRepository)
  const getUserRolesService = new GetUserRolesService(userRolePrismaRepository)

  const userRoles = await getUserRolesService.execute(user.id)

  if (userRoles.length <= 0) {
    return response.status(401).json({ error: 'Unauthorized' })
  }

  const roles = await Promise.all(
    userRoles.map(
      async (role) => await findRoleByIdService.execute(role.roleId),
    ),
  )

  const rolesNames = roles.map((role) => role.name)

  if (user.id !== id && !rolesNames.includes('admin')) {
    return response.status(401).json({ error: 'Unauthorized' })
  }

  next()
}

export { authUser }
