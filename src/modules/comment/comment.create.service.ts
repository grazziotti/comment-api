import { IUserRepository } from '../user/repositories/IUserRepository'
import {
  CommentResponse,
  ICommentRepository,
} from './repositories/ICommentRepository'

interface CommentCreateRequest {
  content: string
  userId: string
  replyToId?: string
}

class CommentCreateService {
  constructor(
    private commentRepository: ICommentRepository,
    private userRepository: IUserRepository,
  ) {}

  public async execute(
    commentData: CommentCreateRequest,
  ): Promise<CommentResponse> {
    const { userId, content, replyToId } = commentData

    const user = await this.userRepository.findById(userId)

    if (!user || user.deletedAt !== null) {
      throw new Error('User not found.')
    }

    if (replyToId) {
      const commentToReply = await this.commentRepository.findById(replyToId)

      if (!commentToReply) {
        throw new Error('Comment to reply not found.')
      }

      if (commentToReply.userId === userId) {
        throw new Error('User cannot reply to themselves.')
      }

      if (commentToReply.parentId) {
        const createdComment = await this.commentRepository.save({
          userId,
          content,
          replyToId: commentToReply.id,
          replyToUserId: commentToReply.userId,
          parentId: commentToReply.parentId,
        })

        return {
          id: createdComment.id,
          content: createdComment.content,
          createdAt: createdComment.createdAt,
          reply: true,
        }
      }

      const createdComment = await this.commentRepository.save({
        userId,
        content,
        replyToId: commentToReply.id,
        replyToUserId: commentToReply.userId,
        parentId: commentToReply.id,
      })

      return {
        id: createdComment.id,
        content: createdComment.content,
        createdAt: createdComment.createdAt,
        reply: true,
      }
    }

    const createdComment = await this.commentRepository.save({
      userId,
      content,
      replyToUserId: null,
      replyToId: null,
      parentId: null,
    })

    return {
      id: createdComment.id,
      content: createdComment.content,
      createdAt: createdComment.createdAt,
    }
  }
}

export { CommentCreateService }
