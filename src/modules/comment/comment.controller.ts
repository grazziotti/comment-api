import { Request, Response } from 'express'
import { CommentPrismaRepository } from './repositories/CommentPrismaRepository'
import { UserSave } from '../user/repositories/IUserRepository'
import { CommentGetAllPublicService } from './comment.getAllPublic.service'
import { CommentCreateService } from './comment.create.service'
import { CommentEditService } from './comment.edit.service'
import { CommentDeleteService } from './comment.delete.service'

import { UserPrismaRepository } from '../user/repositories/UserPrismaRepository'
import { VotePrismaRepository } from '../vote/repositories/VotePrismaRepository'
import { CommentGetAllPrivateService } from './comment.getAllPrivate.service'
import { CommentGetService } from './comment.get.service'

class CommentController {
  async getAllPrivate(request: Request, response: Response): Promise<Response> {
    const user = request.user as UserSave

    const prismaCommentRepository = new CommentPrismaRepository()
    const prismaUserRepository = new UserPrismaRepository()
    const prismaVoteRepository = new VotePrismaRepository()
    const commentGetAllPrivateService = new CommentGetAllPrivateService(
      prismaCommentRepository,
      prismaVoteRepository,
      prismaUserRepository,
    )

    const commentsWithRepliesAndVotes =
      await commentGetAllPrivateService.execute(user.id)

    return response.json(commentsWithRepliesAndVotes)
  }

  async getAllPublic(request: Request, response: Response): Promise<Response> {
    const prismaCommentRepository = new CommentPrismaRepository()
    const prismaUserRepository = new UserPrismaRepository()
    const prismaVoteRepository = new VotePrismaRepository()
    const commentGetAllPublicService = new CommentGetAllPublicService(
      prismaCommentRepository,
      prismaVoteRepository,
      prismaUserRepository,
    )

    const commentsWithRepliesAndVotes =
      await commentGetAllPublicService.execute()

    return response.json(commentsWithRepliesAndVotes)
  }
  async get(request: Request, response: Response): Promise<Response> {
    try {
      const prismaCommentRepository = new CommentPrismaRepository()
      const commentGetService = new CommentGetService(prismaCommentRepository)

      const { commentId } = request.params

      const commentsWithRepliesAndLikes =
        await commentGetService.execute(commentId)

      return response.json(commentsWithRepliesAndLikes)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return response.status(400).json({ error: error.message })
    }
  }
  async create(request: Request, response: Response): Promise<Response> {
    try {
      const user = request.user as UserSave

      const { content, replyToId } = request.body

      const prismaCommentRepository = new CommentPrismaRepository()
      const prismaUserRepository = new UserPrismaRepository()
      const commentCreateService = new CommentCreateService(
        prismaCommentRepository,
        prismaUserRepository,
      )

      const createdComment = await commentCreateService.execute({
        content,
        userId: user.id,
        replyToId,
      })

      return response.status(201).json(createdComment)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return response.status(400).json({ error: error.message })
    }
  }
  async edit(request: Request, response: Response): Promise<Response> {
    try {
      const user = request.user as UserSave

      const { commentId } = request.params
      const { content } = request.body

      const prismaCommentRepository = new CommentPrismaRepository()
      const prismaUserRepository = new UserPrismaRepository()
      const commentEditService = new CommentEditService(
        prismaCommentRepository,
        prismaUserRepository,
      )

      const updatedComment = await commentEditService.execute({
        newContent: content,
        userId: user.id,
        id: commentId,
      })

      return response.status(200).json(updatedComment)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return response.status(400).json({ error: error.message })
    }
  }
  async delete(request: Request, response: Response): Promise<Response> {
    try {
      const user = request.user as UserSave

      const { commentId } = request.params

      const prismaCommentRepository = new CommentPrismaRepository()
      const prismaUserRepository = new UserPrismaRepository()
      const commentDeleteService = new CommentDeleteService(
        prismaCommentRepository,
        prismaUserRepository,
      )

      await commentDeleteService.execute({ id: commentId, userId: user.id })

      return response.status(204).send()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return response.status(400).json({ error: error.message })
    }
  }
}

export { CommentController }
