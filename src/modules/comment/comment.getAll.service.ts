import { ICommentRepository } from './repositories/ICommentRepository'

class CommentGetAllService {
  constructor(private commentRepository: ICommentRepository) {}

  public async execute() {
    const commentsWithRepliesAndLikes = await this.commentRepository.getAll()

    return commentsWithRepliesAndLikes
  }
}

export { CommentGetAllService }
