import { Request, Response } from 'express'
import { LikePrismaRepository } from './repositories/LikePrismaRepository'
import { LikeCreateService } from './like.create.service'
import { UserSave } from '../user/repositories/IUserRepository'
import { CommentPrismaRepository } from '../../modules/comment/repositories/CommentPrismaRepository'
import { UserPrismaRepository } from '@/modules/user/repositories/UserPrismaRepository'

class LikeController {
  async create(request: Request, response: Response): Promise<Response> {
    try {
      const user = request.user as UserSave

      const { commentId } = request.params

      const prismaLikeRepository = new LikePrismaRepository()
      const prismaUserRepository = new UserPrismaRepository()
      const prismaCommentRepository = new CommentPrismaRepository()
      const likeCreateService = new LikeCreateService(
        prismaLikeRepository,
        prismaUserRepository,
        prismaCommentRepository,
      )

      const createdLike = await likeCreateService.execute({
        commentId,
        userId: user.id,
      })

      return response.json(createdLike)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return response.status(400).json({ error: error.message })
    }
  }
}

export { LikeController }
