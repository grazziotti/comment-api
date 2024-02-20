import { IVoteRepository } from './repositories/IVoteRepository'

type VoteEditRequest = {
  voteId: string
  userId: string
  voteType: string
}

class VoteEditService {
  constructor(private voteRepository: IVoteRepository) {}

  async execute(data: VoteEditRequest) {
    const { voteId, voteType } = data

    const vote = await this.voteRepository.findById(voteId)

    if (!vote) {
      throw new Error('Vote not found.')
    }

    if (voteType !== 'upVote' && voteType !== 'downVote') {
      throw new Error('Invalid voteType.')
    }

    if (vote.voteType === voteType) {
      return vote
    }

    const updatedVote = await this.voteRepository.edit(voteId, voteType)

    return updatedVote
  }
}

export { VoteEditService }
