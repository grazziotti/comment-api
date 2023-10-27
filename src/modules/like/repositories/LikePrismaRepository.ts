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

  async findById(id: string) {
    const like = await prismaClient.like.findUnique({
      where: {
        id,
      },
    })

    return like
  }

  async delete(id: string): Promise<void> {
    await prismaClient.like.delete({
      where: {
        id,
      },
    })
    return
  }
}

export { LikePrismaRepository }
