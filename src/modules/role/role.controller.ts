import { Request, Response } from 'express'
import { RolePrismaRepository } from './repositories/RolePrismaRepository'
import { CreateRoleService } from './role.create.service'
import { FindRoleByIdService } from './role.findById.service'

class RoleController {
  async create(request: Request, response: Response): Promise<Response> {
    try {
      const { name } = request.body

      const prismaRepository = new RolePrismaRepository()
      const createRoleService = new CreateRoleService(prismaRepository)

      const role = await createRoleService.execute({
        name,
      })

      return response.status(201).json(role)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      return response.status(400).json({ error: err.message })
    }
  }

  async get(request: Request, response: Response): Promise<Response> {
    try {
      const { roleId } = request.params

      const prismaRepository = new RolePrismaRepository()
      const findRoleByIdService = new FindRoleByIdService(prismaRepository)

      const role = await findRoleByIdService.execute(roleId)

      return response.status(200).json(role)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      return response.status(400).json({ error: err.message })
    }
  }
}

export { RoleController }
