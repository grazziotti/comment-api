import { Request, Response } from 'express'
import { VotePrismaRepository } from './repositories/VotePrismaRepository'
import { VoteCreateService } from './vote.create.service'
import { UserSave } from '../user/repositories/IUserRepository'
import { CommentPrismaRepository } from '../comment/repositories/CommentPrismaRepository'
import { VoteDeleteService } from './vote.delete.service'
import { UserPrismaRepository } from '../user/repositories/UserPrismaRepository'

class VoteController {
  async create(request: Request, response: Response): Promise<Response> {
    try {
      const user = request.user as UserSave

      const { commentId, voteType } = request.body

      const prismaVoteRepository = new VotePrismaRepository()
      const prismaCommentRepository = new CommentPrismaRepository()
      const prismaUserRepository = new UserPrismaRepository()
      const voteCreateService = new VoteCreateService(
        prismaVoteRepository,
        prismaCommentRepository,
        prismaUserRepository,
      )

      const createdVote = await voteCreateService.execute({
        commentId,
        userId: user.id,
        voteType,
      })

      return response.status(201).json(createdVote)
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
      const prismaUserRepository = new UserPrismaRepository()

      const voteDeleteService = new VoteDeleteService(
        prismaVoteRepository,
        prismaUserRepository,
      )

      await voteDeleteService.execute({ voteId: id, userId: user.id })

      return response.status(204).send()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return response.status(400).json({ error: error.message })
    }
  }
}

export { VoteController }
