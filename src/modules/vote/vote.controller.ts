import { Request, Response } from 'express'
import { VotePrismaRepository } from './repositories/VotePrismaRepository'
import { VoteCreateService } from './vote.create.service'
import { UserSave } from '../user/repositories/IUserRepository'
import { CommentPrismaRepository } from '../comment/repositories/CommentPrismaRepository'
import { VoteDeleteService } from './vote.delete.service'
import { VoteEditService } from './vote.edit.service'

class VoteController {
  async create(request: Request, response: Response): Promise<Response> {
    try {
      const user = request.user as UserSave

      const { commentId, voteType } = request.body

      const prismaVoteRepository = new VotePrismaRepository()
      const prismaCommentRepository = new CommentPrismaRepository()
      const voteCreateService = new VoteCreateService(
        prismaVoteRepository,
        prismaCommentRepository,
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

  async edit(request: Request, response: Response): Promise<Response> {
    try {
      const user = request.user as UserSave

      const { id } = request.params
      const { voteType } = request.body

      const prismaVoteRepository = new VotePrismaRepository()
      const voteEditService = new VoteEditService(prismaVoteRepository)

      await voteEditService.execute({ voteId: id, userId: user.id, voteType })

      return response.status(200).send()
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
