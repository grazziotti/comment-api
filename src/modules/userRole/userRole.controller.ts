import { Request, Response } from 'express'
import { UserRoleCreateService } from './userRole.create.service'
import { UserRolePrismaRepository } from './repositories/UserRolePrismaRepository'
import { RolePrismaRepository } from '../role/repositories/RolePrismaRepository'
import { UserPrismaRepository } from '../user/repositories/UserPrismaRepository'

class UserRoleController {
  async create(request: Request, response: Response): Promise<Response> {
    try {
      const { roleId, userId } = request.body

      const userRolePrismaRepository = new UserRolePrismaRepository()
      const userPrismaRepository = new UserPrismaRepository()
      const rolePrismaRepository = new RolePrismaRepository()
      const createUserRoleService = new UserRoleCreateService(
        userRolePrismaRepository,
        userPrismaRepository,
        rolePrismaRepository,
      )

      const createdUserRole = await createUserRoleService.execute({
        roleId,
        userId,
      })

      return response.status(201).json(createdUserRole)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      return response.status(400).json({ error: err.message })
    }
  }
}

export { UserRoleController }
