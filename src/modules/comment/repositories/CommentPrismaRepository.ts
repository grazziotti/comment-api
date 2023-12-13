import { prismaClient } from '../../../database/client'
import {
  CommentCreate,
  CommentEdit,
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
  async getAll() {
    const commentsWithRepliesAndVotes = await prismaClient.comment.findMany({
      where: {
        replyToId: null,
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            username: true,
          },
        },
        replies: {
          select: {
            id: true,
            content: true,
            createdAt: true,
            updatedAt: true,
            user: {
              select: {
                username: true,
              },
            },
            replyTo: {
              select: {
                user: {
                  select: {
                    username: true,
                  },
                },
              },
            },
            votes: {
              select: {
                voteType: true,
              },
            },
          },
        },
        votes: {
          select: {
            voteType: true,
          },
        },
      },
    })

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
        updatedAt: new Date(),
      },
    })

    return updatedComment
  }
  async delete(id: string) {
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
