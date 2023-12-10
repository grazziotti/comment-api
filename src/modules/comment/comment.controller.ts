import { Request, Response } from 'express'
import { CommentPrismaRepository } from './repositories/CommentPrismaRepository'
import { UserSave } from '../user/repositories/IUserRepository'
import { CommentGetAllService } from './comment.getAll.service'
import { CommentCreateService } from './comment.create.service'
import { CommentEditService } from './comment.edit.service'
import { CommentDeleteService } from './comment.delete.service'
import { CommentGetService } from './comment.get.service'
import { VotePrismaRepository } from '../vote/repositories/VotePrismaRepository'
import { UserPrismaRepository } from '../user/repositories/UserPrismaRepository'

class CommentController {
  async getAll(request: Request, response: Response): Promise<Response> {
    const prismaCommentRepository = new CommentPrismaRepository()
    const prismaVoteRepository = new VotePrismaRepository()
    const prismaUserRepository = new UserPrismaRepository()

    const commentGetAllService = new CommentGetAllService(
      prismaCommentRepository,
      prismaVoteRepository,
      prismaUserRepository,
    )

    const commentsWithRepliesAndLikes = await commentGetAllService.execute()

    return response.json(commentsWithRepliesAndLikes)
  }
  async get(request: Request, response: Response): Promise<Response> {
    try {
      const prismaCommentRepository = new CommentPrismaRepository()
      const commentGetAllService = new CommentGetService(
        prismaCommentRepository,
      )

      const { id } = request.params

      const commentsWithRepliesAndLikes = await commentGetAllService.execute(id)

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

      const { id } = request.params
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
        id,
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

      const { id } = request.params

      const prismaCommentRepository = new CommentPrismaRepository()
      const prismaUserRepository = new UserPrismaRepository()
      const commentDeleteService = new CommentDeleteService(
        prismaCommentRepository,
        prismaUserRepository,
      )

      await commentDeleteService.execute({ id, userId: user.id })

      return response.status(204).send()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return response.status(400).json({ error: error.message })
    }
  }
}

export { CommentController }
