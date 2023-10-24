import { prismaClient } from '../../../database/client'
import {
  CommentCreate,
  CommentSave,
  ICommentRepository,
} from './ICommentRepository'

class CommentPrismaRepository implements ICommentRepository {
  async save(data: CommentCreate): Promise<CommentSave> {
    const { content, userId, parentId, replyToId } = data

    const createdComment = await prismaClient.comment.create({
      data: {
        userId,
        content,
        parentId,
        replyToId,
      },
    })
    return createdComment
  }
  async findById(id: string): Promise<CommentSave | null> {
    const comment = await prismaClient.comment.findUnique({
      where: {
        id,
      },
    })
    return comment
  }
  async getAll(): Promise<CommentSave[]> {
    const commentsWithRepliesAndLikes = await prismaClient.comment.findMany({
      include: {
        replies: {
          include: {
            likes: true,
          },
        },
        likes: true,
      },
    })

    return commentsWithRepliesAndLikes
  }
}

export { CommentPrismaRepository }
