import { Request, Response } from 'express'
import { CommentPrismaRepository } from './repositories/CommentPrismaRepository'
import { UserSave } from '../user/repositories/IUserRepository'
import { CommentGetAllService } from './comment.getAll.service'
import { CommentCreateService } from './comment.create.service'
import { CommentEditService } from './comment.edit.service'

class CommentController {
  async getAll(request: Request, response: Response): Promise<Response> {
    const prismaCommentRepository = new CommentPrismaRepository()
    const commentGetAllService = new CommentGetAllService(
      prismaCommentRepository,
    )

    const commentsWithRepliesAndLikes = await commentGetAllService.execute()

    return response.json(commentsWithRepliesAndLikes)
  }
  async create(request: Request, response: Response): Promise<Response> {
    try {
      const user = request.user as UserSave

      const { replyToId } = request.params
      const { content } = request.body

      const prismaCommentRepository = new CommentPrismaRepository()
      const commentCreateService = new CommentCreateService(
        prismaCommentRepository,
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
      const commentEditService = new CommentEditService(prismaCommentRepository)

      const updatedComment = await commentEditService.execute({
        newContent: content,
        userId: user.id,
        commentId,
      })

      return response.status(200).json(updatedComment)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return response.status(400).json({ error: error.message })
    }
  }
}

export { CommentController }
