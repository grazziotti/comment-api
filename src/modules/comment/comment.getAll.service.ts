import { ICommentRepository } from './repositories/ICommentRepository'

class CommentGetAllService {
  constructor(private commentRepository: ICommentRepository) {}

  public async execute() {
    const commentsWithRepliesAndVotes = await this.commentRepository.getAll()

    return commentsWithRepliesAndVotes
  }
}

export { CommentGetAllService }
