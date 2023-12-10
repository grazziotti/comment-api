import { IUserRepository } from '../user/repositories/IUserRepository'
import { ICommentRepository } from './repositories/ICommentRepository'

type CommentEditRequest = {
  id: string
  newContent: string
  userId: string
}

class CommentEditService {
  constructor(
    private commentRepository: ICommentRepository,
    private userRepository: IUserRepository,
  ) {}

  public async execute(data: CommentEditRequest) {
    const { id, newContent, userId } = data

    const comment = await this.commentRepository.findById(id)

    const user = await this.userRepository.findById(userId)

    if (!user || user.deletedAt !== null) {
      throw new Error('User not found.')
    }

    if (!comment) {
      throw new Error('Comment not found.')
    }

    if (comment.userId !== userId) {
      throw new Error('User is not authorized to edit this comment.')
    }

    const updatedComment = await this.commentRepository.edit({
      id,
      newContent,
    })

    return {
      id: updatedComment.id,
      content: updatedComment.content,
      createdAt: updatedComment.createdAt,
    }
  }
}

export { CommentEditService }
