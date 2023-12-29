export type VoteCreate = {
  commentId: string
  voteType: string
  userId: string
}

export type VoteSave = {
  id: string
  commentId: string
  userId: string
  voteType: string
  createdAt: Date
}

export interface IVoteRepository {
  save(data: VoteCreate): Promise<VoteSave>
  checkUserVoteForComment(
    commentId: string,
    userId: string,
  ): Promise<VoteSave | null>
  findById(id: string): Promise<VoteSave | null>
  findVotesByUserId(userId: string): Promise<VoteSave[]>
  findVotesByCommentId(commentId: string): Promise<VoteSave[]>
  edit(id: string, voteType: string): Promise<VoteSave>
  delete(id: string): Promise<void>
}
