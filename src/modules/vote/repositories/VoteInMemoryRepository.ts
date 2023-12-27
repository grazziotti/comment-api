import { randomUUID } from 'crypto'
import { IVoteRepository, VoteCreate, VoteSave } from './IVoteRepository'

class VoteInMemoryRepository implements IVoteRepository {
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

  async edit(id: string, voteType: string) {
    const vote = this.votes.find((vote) => vote.id === id) as VoteSave

    vote.voteType = voteType

    return vote as VoteSave
  }

  async delete(id: string): Promise<void> {
    const voteIndex = this.votes.findIndex((vote) => vote.id === id)
    this.votes.splice(voteIndex, 1)
    return
  }

  async findVotesByCommentId(commentId: string): Promise<VoteSave[]> {
    return this.votes.filter((vote) => vote.commentId === commentId)
  }
}

export { VoteInMemoryRepository }
