import { prismaClient } from '../../../database/client'
import {
  CommentCreate,
  CommentEdit,
  ICommentRepository,
} from './ICommentRepository'

class CommentPrismaRepository implements ICommentRepository {
  async save(data: CommentCreate) {
    const { content, userId, parentId, replyToId, replyToUserId } = data

    const createdComment = await prismaClient.comment.create({
      data: {
        userId,
        content,
        parentId,
        replyToId,
        replyToUserId,
      },
    })

    return createdComment
  }
  async findRepliesByCommentId(id: string) {
    const replies = await prismaClient.comment.findMany({
      where: {
        parentId: id,
      },
    })

    return replies
  }
  async findById(id: string) {
    const comment = await prismaClient.comment.findUnique({
      where: {
        id,
      },
    })
    return comment
  }

  async getAll() {
    const comments = await prismaClient.comment.findMany()

    return comments
  }

  async edit(data: CommentEdit) {
    const { id, newContent } = data

    const updatedComment = await prismaClient.comment.update({
      where: {
        id,
      },
      data: {
        content: newContent,
        updatedAt: new Date(),
      },
    })

    return updatedComment
  }
  async delete(id: string) {
    await prismaClient.comment.delete({
      where: {
        id,
      },
    })
    return
  }
}

export { CommentPrismaRepository }
