import { ICommentRepository } from './repositories/ICommentRepository'

type CommentDeleteRequest = {
  userId: string
  commentId: string
}

class CommentDeleteService {
  constructor(private commentRepository: ICommentRepository) {}

  public async execute(data: CommentDeleteRequest) {
    const { userId, commentId } = data

    const comment = await this.commentRepository.findById(commentId)

    if (!comment) {
      throw new Error('Comment not found.')
    }

    if (comment.userId !== userId) {
      throw new Error('User is not authorized to delete this comment.')
    }

    await this.commentRepository.delete(commentId)

    return
  }
}

export { CommentDeleteService }
