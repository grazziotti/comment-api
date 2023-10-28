import { ICommentRepository } from './repositories/ICommentRepository'

type CommentDeleteRequest = {
  id: string
  userId: string
}

class CommentDeleteService {
  constructor(private commentRepository: ICommentRepository) {}

  public async execute(data: CommentDeleteRequest) {
    const { id, userId } = data

    const comment = await this.commentRepository.findById(id)

    if (!comment) {
      throw new Error('Comment not found.')
    }

    if (comment.userId !== userId) {
      throw new Error('User is not authorized to delete this comment.')
    }

    await this.commentRepository.delete(id)

    return
  }
}

export { CommentDeleteService }
