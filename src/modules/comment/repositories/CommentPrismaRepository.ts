import { prismaClient } from '../../../database/client'
import {
  CommentCreate,
  CommentEdit,
  CommentSave,
  ICommentRepository,
} from './ICommentRepository'

class CommentPrismaRepository implements ICommentRepository {
  async save(data: CommentCreate) {
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
  async findById(id: string) {
    const comment = await prismaClient.comment.findUnique({
      where: {
        id,
      },
    })
    return comment
  }

  async findRepliesByCommentId(id: string): Promise<CommentSave[]> {
    const replies = await prismaClient.comment.findMany({
      where: {
        parentId: id,
      },
    })

    return replies
  }

  async getAll() {
    const commentsWithRepliesAndVotes = await prismaClient.comment.findMany()

    return commentsWithRepliesAndVotes
  }
  async edit(data: CommentEdit) {
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
  async delete(id: string) {
    await prismaClient.vote.deleteMany({
      where: {
        commentId: id,
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
