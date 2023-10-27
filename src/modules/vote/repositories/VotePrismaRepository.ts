import { prismaClient } from '../../../database/client'
import { IVoteRepository, VoteCreate } from './IVoteRepository'

class VotePrismaRepository implements IVoteRepository {
  async save(data: VoteCreate) {
    const { commentId, userId } = data

    const createdVote = await prismaClient.vote.create({
      data: {
        userId,
        commentId,
      },
    })

    return createdVote
  }

  async checkUserVoteForComment(commentId: string, userId: string) {
    const vote = await prismaClient.vote.findFirst({
      where: {
        userId,
        commentId,
      },
    })

    return vote
  }

  async findById(id: string) {
    const vote = await prismaClient.vote.findUnique({
      where: {
        id,
      },
    })

    return vote
  }

  async delete(id: string): Promise<void> {
    await prismaClient.vote.delete({
      where: {
        id,
      },
    })
    return
  }
}

export { VotePrismaRepository }
