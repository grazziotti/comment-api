import { Request, Response } from 'express'
import { VotePrismaRepository } from './repositories/VotePrismaRepository'
import { VoteCreateService } from './vote.create.service'
import { UserSave } from '../user/repositories/IUserRepository'
import { CommentPrismaRepository } from '../comment/repositories/CommentPrismaRepository'
import { UserPrismaRepository } from '@/modules/user/repositories/UserPrismaRepository'
import { VoteDeleteService } from './vote.delete.service'

class VoteController {
  async create(request: Request, response: Response): Promise<Response> {
    try {
      const user = request.user as UserSave

      const { commentId } = request.body

      const prismaVoteRepository = new VotePrismaRepository()
      const prismaUserRepository = new UserPrismaRepository()
      const prismaCommentRepository = new CommentPrismaRepository()
      const voteCreateService = new VoteCreateService(
        prismaVoteRepository,
        prismaUserRepository,
        prismaCommentRepository,
      )

      const createdVote = await voteCreateService.execute({
        commentId,
        userId: user.id,
      })

      return response.json(createdVote)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return response.status(400).json({ error: error.message })
    }
  }
  async delete(request: Request, response: Response): Promise<Response> {
    try {
      const user = request.user as UserSave

      const { id } = request.params

      const prismaVoteRepository = new VotePrismaRepository()
      const voteDeleteService = new VoteDeleteService(prismaVoteRepository)

      await voteDeleteService.execute({ voteId: id, userId: user.id })

      return response.status(204).send()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return response.status(400).json({ error: error.message })
    }
  }
}

export { VoteController }
