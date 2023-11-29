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
  constructor(private commentRepository: ICommentRepository) {}

  public async execute(
    commentData: CommentCreateRequest,
  ): Promise<CommentResponse> {
    const { userId, content, replyToId } = commentData

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
