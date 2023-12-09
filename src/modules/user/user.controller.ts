import { Request, Response } from 'express'
import { UserPrismaRepository } from './repositories/UserPrismaRepository'
import { CreateUserService } from './user.create.service'
import { UserSave } from './repositories/IUserRepository'
import { UserEditService } from './user.edit.service'
import { UserDeleteService } from './user.delete.service'

class UserController {
  async create(request: Request, response: Response): Promise<Response> {
    try {
      const { username, password } = request.body

      const prismaRepository = new UserPrismaRepository()
      const createUserService = new CreateUserService(prismaRepository)

      const user = await createUserService.execute({
        username,
        password,
      })

      return response.status(201).json(user)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      return response.status(400).json({ error: err.message })
    }
  }
  async get(request: Request, response: Response): Promise<Response> {
    const user = request.user as UserSave

    return response.status(200).json({
      id: user.id,
      username: user.username,
      createdAt: user.createdAt,
    })
  }
  async update(request: Request, response: Response): Promise<Response> {
    try {
      const user = request.user as UserSave

      const { password } = request.body

      const prismaRepository = new UserPrismaRepository()
      const userEditService = new UserEditService(prismaRepository)

      const updatedUser = await userEditService.execute({
        id: user.id,
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
      const user = request.user as UserSave

      const prismaRepository = new UserPrismaRepository()
      const userDeleteService = new UserDeleteService(prismaRepository)

      await userDeleteService.execute(user.id)

      return response.status(204).send()

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      return response.status(400).json({ error: err.message })
    }
  }
}

export { UserController }
