import { IUserRepository } from '../user/repositories/IUserRepository'
import { IVoteRepository } from './repositories/IVoteRepository'

type VoteDeleteRequest = {
  voteId: string
  userId: string
}

class VoteDeleteService {
  constructor(
    private voteRepository: IVoteRepository,
    private userRepository: IUserRepository,
  ) {}

  async execute(data: VoteDeleteRequest) {
    const { voteId, userId } = data

    const vote = await this.voteRepository.findById(voteId)

    const user = await this.userRepository.findById(userId)

    if (!user || user.deletedAt !== null) {
      throw new Error('User not found.')
    }

    if (!vote) {
      throw new Error('Vote not found.')
    }

    if (vote.userId !== userId) {
      throw new Error('User is not authorized to delete this vote.')
    }

    await this.voteRepository.delete(vote.id)

    return
  }
}

export { VoteDeleteService }
