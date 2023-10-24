import { ICommentRepository } from './repositories/ICommentRepository'

type CommentEditRequest = {
  commentId: string
  newContent: string
  userId: string
}

class CommentEditService {
  constructor(private commentRepository: ICommentRepository) {}

  public async execute(data: CommentEditRequest) {
    const { commentId, newContent, userId } = data

    const comment = await this.commentRepository.findById(commentId)

    if (!comment) {
      throw new Error('Comment not found.')
    }

    if (comment.userId !== userId) {
      throw new Error('User is not authorized to edit this comment.')
    }

    const updatedComment = await this.commentRepository.edit({
      commentId,
      newContent,
    })

    return updatedComment
  }
}

export { CommentEditService }
