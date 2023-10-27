export type VoteCreate = {
  commentId: string
  userId: string
}

export type VoteSave = {
  id: string
  commentId: string
  userId: string
  createdAt: Date
}

export interface IVoteRepository {
  save(data: VoteCreate): Promise<VoteSave>
  checkUserVoteForComment(
    commentId: string,
    userId: string,
  ): Promise<VoteSave | null>
  findById(id: string): Promise<VoteSave | null>
  delete(id: string): Promise<void>
}
