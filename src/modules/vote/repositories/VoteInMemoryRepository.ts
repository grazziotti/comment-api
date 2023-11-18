import { randomUUID } from 'crypto'
import { IVoteRepository, VoteCreate, VoteSave } from './IVoteRepository'

class VoteInMemoryRepository implements IVoteRepository {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  votes: VoteSave[] = []

  async save(data: VoteCreate): Promise<VoteSave> {
    const id = randomUUID()
    const createdAt = new Date()

    const vote: VoteSave = {
      ...data,
      id,
      createdAt,
    }

    this.votes.push(vote)

    return vote
  }
  async findById(id: string): Promise<VoteSave | null> {
    const vote = this.votes.find((vote) => vote.id === id)
    return vote ? vote : null
  }
  async checkUserVoteForComment(
    commentId: string,
    userId: string,
  ): Promise<VoteSave | null> {
    const vote = this.votes.find(
      (vote) => vote.userId === userId && vote.commentId === commentId,
    )
    return vote ? vote : null
  }

  async delete(id: string): Promise<void> {
    const voteIndex = this.votes.findIndex((vote) => vote.id === id)
    this.votes.splice(voteIndex, 1)
    return
  }
}

export { VoteInMemoryRepository }
