export type LikeCreate = {
  commentId: string
  userId: string
}

export type LikeSave = {
  id: string
  commentId: string
  userId: string
  createdAt: Date
}

export interface ILikeRepository {
  save(data: LikeCreate): Promise<LikeSave>
  checkUserVoteForComment(
    commentId: string,
    userId: string,
  ): Promise<LikeSave | null>
  findById(id: string): Promise<LikeSave | null>
  delete(id: string): Promise<void>
}
