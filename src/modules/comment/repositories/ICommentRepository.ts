export type CommentCreate = {
  content: string
  userId: string
  parentId: string | null
  replyToId: string | null
}

export type CommentSave = {
  id: string
  content: string
  userId: string
  parentId: string | null
  replyToId: string | null
  createdAt: Date
}

export interface ICommentRepository {
  save(data: CommentCreate): Promise<CommentSave>
  findById(id: string): Promise<CommentSave | null>
  getAll(): Promise<CommentSave[]>
}