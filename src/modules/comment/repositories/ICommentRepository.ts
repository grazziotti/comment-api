export type CommentCreate = {
  content: string
  userId: string
  parentId: string | null
  replyToId: string | null
  replyToUserId: string | null
}

export type CommentEdit = {
  id: string
  newContent: string
}

export type CommentSave = {
  id: string
  content: string
  userId: string
  parentId: string | null
  replyToId: string | null
  replyToUserId: string | null
  createdAt: Date
  updatedAt: Date | null
  replies?: CommentSave[]
}

export type CommentResponse = {
  id: string
  content: string
  createdAt: Date
  reply?: boolean
}

export interface ICommentRepository {
  save(data: CommentCreate): Promise<CommentSave>
  findById(id: string): Promise<CommentSave | null>
  findRepliesByCommentId(id: string): Promise<CommentSave[]>
  getAll(): Promise<CommentSave[]>
  edit(data: CommentEdit): Promise<CommentSave>
  delete(id: string): Promise<void>
}
