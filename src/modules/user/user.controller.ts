import { Request, Response } from 'express'
import { UserPrismaRepository } from './repositories/UserPrismaRepository'
import { CreateUserService } from './user.create.service'
import { UserEditService } from './user.edit.service'
import { UserDeleteService } from './user.delete.service'
import { FindUserByIdService } from './user.findById.service'
import { RolePrismaRepository } from '../role/repositories/RolePrismaRepository'
import { UserRolePrismaRepository } from '../userRole/repositories/UserRolePrismaRepository'

class UserController {
  async create(request: Request, response: Response): Promise<Response> {
    try {
      const { username, password } = request.body

      const userPrismaRepository = new UserPrismaRepository()
      const userRolePrismaRepository = new UserRolePrismaRepository()
      const rolePrismaRepository = new RolePrismaRepository()
      const createUserService = new CreateUserService(
        userPrismaRepository,
        userRolePrismaRepository,
        rolePrismaRepository,
      )

      const user = await createUserService.execute({
        username,
        password,
        avatar: request.file?.buffer ? request.file?.buffer : null,
      })

      return response.status(201).json(user)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      return response.status(400).json({ error: err.message })
    }
  }
  async get(request: Request, response: Response): Promise<Response> {
    try {
      const { id } = request.params

      const userPrismaRepository = new UserPrismaRepository()
      const findUserByIdService = new FindUserByIdService(userPrismaRepository)

      const user = await findUserByIdService.execute(id)

      if (!user) {
        return response.status(400).json({ error: 'User not found.' })
      }

      return response.status(200).json({
        id: user.id,
        username: user.username,
        createdAt: user.createdAt,
        deletedAt: user.deletedAt,
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      return response.status(400).json({ error: err.message })
    }
  }
  async update(request: Request, response: Response): Promise<Response> {
    try {
      const { id } = request.params

      const { password } = request.body

      const prismaRepository = new UserPrismaRepository()
      const userEditService = new UserEditService(prismaRepository)

      const updatedUser = await userEditService.execute({
        id,
        password,
      })

      return response.status(200).json(updatedUser)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      return response.status(400).json({ error: err.message })
    }
  }
  async delete(request: Request, response: Response): Promise<Response> {
    try {
      const { id } = request.params

      const prismaRepository = new UserPrismaRepository()
      const userDeleteService = new UserDeleteService(prismaRepository)

      await userDeleteService.execute(id)

      return response.status(204).send()

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      return response.status(400).json({ error: err.message })
    }
  }
}

export { UserController }
