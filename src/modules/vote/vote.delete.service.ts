import { IVoteRepository } from './repositories/IVoteRepository'

type VoteDeleteRequest = {
  voteId: string
  userId: string
}

class VoteDeleteService {
  constructor(private voteRepository: IVoteRepository) {}

  async execute(data: VoteDeleteRequest) {
    const { voteId, userId } = data

    const vote = await this.voteRepository.findById(voteId)

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
