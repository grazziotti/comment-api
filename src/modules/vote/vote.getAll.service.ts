import { IUserRepository } from '../user/repositories/IUserRepository'
import { IVoteRepository } from './repositories/IVoteRepository'

type VoteGetAllRequest = {
  userId: string
}

class VoteGetAllService {
  constructor(
    private voteRepository: IVoteRepository,
    private userRepository: IUserRepository,
  ) {}

  async execute(data: VoteGetAllRequest) {
    const { userId } = data

    const user = await this.userRepository.findById(userId)

    if (!user) {
      throw new Error('User not found.')
    }

    const votes = await this.voteRepository.findVotesByUserId(userId)

    return votes
  }
}

export { VoteGetAllService }
