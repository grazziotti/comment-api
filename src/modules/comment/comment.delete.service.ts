import { IUserRepository } from '../user/repositories/IUserRepository'
import { ICommentRepository } from './repositories/ICommentRepository'

type CommentDeleteRequest = {
  id: string
  userId: string
}

class CommentDeleteService {
  constructor(
    private commentRepository: ICommentRepository,
    private userRepository: IUserRepository,
  ) {}

  public async execute(data: CommentDeleteRequest) {
    const { id, userId } = data

    const user = await this.userRepository.findById(userId)

    if (!user || user.deletedAt !== null) {
      throw new Error('User not found.')
    }

    const comment = await this.commentRepository.findById(id)

    if (!comment) {
      throw new Error('Comment not found.')
    }

    await this.commentRepository.delete(id)

    return
  }
}

export { CommentDeleteService }
