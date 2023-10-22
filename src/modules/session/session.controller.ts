import { Request, Response } from 'express'
import { UserPrismaRepository } from '@/modules/user/repositories/UserPrismaRepository'
import { SessionService } from './session.create.service'

class SessionController {
  async create(request: Request, response: Response): Promise<Response> {
    try {
      const { username, password } = request.body

      const prismaRepository = new UserPrismaRepository()
      const createSession = new SessionService(prismaRepository)

      const session = await createSession.execute({
        username,
        password,
      })

      return response.json(session)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      return response.status(400).json({ error: err.message })
    }
  }
}

export { SessionController }
