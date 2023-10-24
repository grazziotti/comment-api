import { ICommentRepository } from './repositories/ICommentRepository'

interface CommentCreateRequest {
  content: string
  userId: string
  replyToId?: string
}

class CommentCreateService {
  constructor(private commentRepository: ICommentRepository) {}

  public async execute(commentData: CommentCreateRequest) {
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

        return createdComment
      }

      const createdComment = await this.commentRepository.save({
        userId,
        content,
        replyToId: commentToReply.id,
        parentId: commentToReply.id,
      })

      return createdComment
    }

    const createdComment = await this.commentRepository.save({
      userId,
      content,
      replyToId: null,
      parentId: null,
    })

    return createdComment
  }
}

export { CommentCreateService }
