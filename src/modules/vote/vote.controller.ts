import { Request, Response } from 'express'
import { VotePrismaRepository } from './repositories/VotePrismaRepository'
import { VoteCreateService } from './vote.create.service'
import { UserSave } from '../user/repositories/IUserRepository'
import { CommentPrismaRepository } from '../comment/repositories/CommentPrismaRepository'
import { VoteDeleteService } from './vote.delete.service'
import { VoteEditService } from './vote.edit.service'
import { UserPrismaRepository } from '../user/repositories/UserPrismaRepository'
import { VoteGetAllService } from './vote.getAll.service'
import { VoteGetService } from './vote.get.service'

class VoteController {
  async get(request: Request, response: Response): Promise<Response> {
    try {
      const user = request.user as UserSave

      const { voteId } = request.params

      const prismaVoteRepository = new VotePrismaRepository()
      const prismaUserRepository = new UserPrismaRepository()
      const voteGetService = new VoteGetService(
        prismaVoteRepository,
        prismaUserRepository,
      )

      const vote = await voteGetService.execute({
        id: voteId,
        userId: user.id,
      })

      return response.status(200).json(vote)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return response.status(400).json({ error: error.message })
    }
  }

  async getAll(request: Request, response: Response): Promise<Response> {
    try {
      const user = request.user as UserSave

      const prismaVoteRepository = new VotePrismaRepository()
      const prismaUserRepository = new UserPrismaRepository()
      const voteGetAllService = new VoteGetAllService(
        prismaVoteRepository,
        prismaUserRepository,
      )

      const votes = await voteGetAllService.execute({
        userId: user.id,
      })

      return response.status(200).json(votes)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return response.status(400).json({ error: error.message })
    }
  }

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

  async edit(request: Request, response: Response): Promise<Response> {
    try {
      const user = request.user as UserSave

      const { voteId } = request.params
      const { voteType } = request.body

      const prismaVoteRepository = new VotePrismaRepository()
      const voteEditService = new VoteEditService(prismaVoteRepository)

      const updatedVote = await voteEditService.execute({
        voteId,
        userId: user.id,
        voteType,
      })

      return response.status(200).json(updatedVote)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return response.status(400).json({ error: error.message })
    }
  }

  async delete(request: Request, response: Response): Promise<Response> {
    try {
      const user = request.user as UserSave

      const { voteId } = request.params

      const prismaVoteRepository = new VotePrismaRepository()
      const prismaUserRepository = new UserPrismaRepository()

      const voteDeleteService = new VoteDeleteService(
        prismaVoteRepository,
        prismaUserRepository,
      )

      await voteDeleteService.execute({ voteId, userId: user.id })

      return response.status(204).send()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return response.status(400).json({ error: error.message })
    }
  }
}

export { VoteController }
