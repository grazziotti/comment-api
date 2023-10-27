import { IVoteRepository, VoteCreate } from './repositories/IVoteRepository'
import { IUserRepository } from '../user/repositories/IUserRepository'
import { ICommentRepository } from '../comment/repositories/ICommentRepository'

class VoteCreateService {
  constructor(
    private voteRepository: IVoteRepository,
    private userRepository: IUserRepository,
    private commentRepository: ICommentRepository,
  ) {}

  async execute(commentData: VoteCreate) {
    const { commentId, voteType, userId } = commentData

    const user = await this.userRepository.findById(userId)

    if (!user) {
      throw new Error('User not found.')
    }

    const comment = await this.commentRepository.findById(commentId)

    if (comment) {
      if (comment.userId === userId) {
        throw new Error('User cannot vote their own comment.')
      }

      const alreadyVoted = await this.voteRepository.checkUserVoteForComment(
        comment.id,
        user.id,
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
