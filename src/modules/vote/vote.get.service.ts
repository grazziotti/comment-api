import { IUserRepository } from '../user/repositories/IUserRepository'
import { IVoteRepository } from './repositories/IVoteRepository'

type VoteGetRequest = {
  id: string
  userId: string
}

class VoteGetService {
  constructor(
    private voteRepository: IVoteRepository,
    private userRepository: IUserRepository,
  ) {}

  async execute(data: VoteGetRequest) {
    const { id, userId } = data

    const user = await this.userRepository.findById(userId)

    if (!user) {
      throw new Error('User not found.')
    }

    const vote = await this.voteRepository.findById(id)

    if (!vote) {
      throw new Error('Vote not found.')
    }

    if (vote && vote.userId !== userId) {
      throw new Error('User is not authorized to get this vote.')
    }

    return vote
  }
}

export { VoteGetService }
