import { IVoteRepository, VoteCreate } from './repositories/IVoteRepository'
import { ICommentRepository } from '../comment/repositories/ICommentRepository'
import { IUserRepository } from '../user/repositories/IUserRepository'

class VoteCreateService {
  constructor(
    private voteRepository: IVoteRepository,
    private commentRepository: ICommentRepository,
    private userRepository: IUserRepository,
  ) {}

  async execute(commentData: VoteCreate) {
    const { commentId, voteType, userId } = commentData

    const comment = await this.commentRepository.findById(commentId)

    const user = await this.userRepository.findById(userId)

    if (!user || user.deletedAt !== null) {
      throw new Error('User not found.')
    }

    if (comment) {
      if (comment.userId === userId) {
        throw new Error('User cannot vote their own comment.')
      }

      const alreadyVoted = await this.voteRepository.checkUserVoteForComment(
        comment.id,
        userId,
      )

      if (alreadyVoted) {
        throw new Error('User has already voted this comment.')
      }

      if (voteType !== 'upVote' && voteType !== 'downVote') {
        throw new Error('Invalid voteType.')
      }

      const createdVote = await this.voteRepository.save({
        commentId: comment.id,
        userId,
        voteType,
      })

      return createdVote
    }

    throw new Error('Comment or reply not found.')
  }
}

export { VoteCreateService }
