import { randomUUID } from 'crypto'
import {
  CommentCreate,
  CommentEdit,
  CommentSave,
  ICommentRepository,
} from './ICommentRepository'

class CommentInMemoryRepository implements ICommentRepository {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  comments: CommentSave[] = []

  async save(data: CommentCreate): Promise<CommentSave> {
    const id = randomUUID()
    const createdAt = new Date()

    const comment: CommentSave = {
      ...data,
      id,
      createdAt,
    }

    this.comments.push(comment)

    return comment
  }
  async edit(data: CommentEdit): Promise<CommentSave> {
    const { id, newContent } = data

    const commentIndex = this.comments.findIndex((comment) => comment.id === id)

    this.comments[commentIndex].content = newContent

    return this.comments[commentIndex]
  }

  async getAll(): Promise<CommentSave[]> {
    return this.comments
  }

  async delete(id: string): Promise<void> {
    const commentIndex = this.comments.findIndex((comment) => comment.id === id)
    this.comments.splice(commentIndex, 1)
  }

  async findById(id: string): Promise<CommentSave | null> {
    const comment = this.comments.find((comment) => comment.id === id)

    return comment ? comment : null
  }

  async findRepliesByCommentId(id: string): Promise<CommentSave[]> {
    return this.comments.filter((comment) => comment.parentId === id)
  }
}

export { CommentInMemoryRepository }
