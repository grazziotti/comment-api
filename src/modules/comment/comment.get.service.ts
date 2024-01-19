import { ICommentRepository } from './repositories/ICommentRepository'

class CommentGetService {
  constructor(private commentRepository: ICommentRepository) {}

  public async execute(id: string) {
    const comment = await this.commentRepository.findById(id)

    if (!comment) {
      throw new Error('Comment not found.')
    }

    return comment
  }
}

export { CommentGetService }
