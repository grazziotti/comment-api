export type CommentCreate = {
  content: string
  userId: string
  parentId: string | null
  replyToId: string | null
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
  createdAt: Date
}

export type CommentResponse = {
  id: string
  content: string
  createdAt: Date
}

export interface ICommentRepository {
  save(data: CommentCreate): Promise<CommentSave>
  findById(id: string): Promise<CommentSave | null>
  getAll(): Promise<CommentResponse[]>
  edit(data: CommentEdit): Promise<CommentSave>
  delete(id: string): Promise<void>
}
