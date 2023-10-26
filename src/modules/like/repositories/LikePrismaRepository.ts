import { prismaClient } from '../../../database/client'
import { ILikeRepository, LikeCreate } from './ILikeRepository'

class LikePrismaRepository implements ILikeRepository {
  async save(data: LikeCreate) {
    const { commentId, userId } = data

    const createdLike = await prismaClient.like.create({
      data: {
        userId,
        commentId,
      },
    })

    return createdLike
  }
  async checkUserVoteForComment(commentId: string, userId: string) {
    const like = await prismaClient.like.findFirst({
      where: {
        userId,
        commentId,
      },
    })

    return like
  }
}

export { LikePrismaRepository }
