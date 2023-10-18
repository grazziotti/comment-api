import { Request, Response } from 'express'
import { UserPrismaRepository } from './repositories/UserPrismaRepository'
import { CreateUserService } from './user.create.service'

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

      return response.json(user)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      return response.status(400).json({ error: err.message })
    }
  }
}

export { UserController }
