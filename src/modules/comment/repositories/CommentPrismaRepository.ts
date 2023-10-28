import { prismaClient } from '../../../database/client'
import {
  CommentCreate,
  CommentEdit,
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
    const commentsWithRepliesAndVotes = await prismaClient.comment.findMany({
      include: {
        replies: {
          include: {
            votes: true,
          },
        },
        votes: true,
      },
    })

    return commentsWithRepliesAndVotes
  }
  async edit(data: CommentEdit): Promise<CommentSave> {
    const { id, newContent } = data

    const updatedComment = await prismaClient.comment.update({
      where: {
        id,
      },
      data: {
        content: newContent,
      },
    })

    return updatedComment
  }
  async delete(id: string): Promise<void> {
    await prismaClient.vote.deleteMany({
      where: {
        id,
      },
    })

    await prismaClient.comment.delete({
      where: {
        id,
      },
    })
    return
  }
}

export { CommentPrismaRepository }
