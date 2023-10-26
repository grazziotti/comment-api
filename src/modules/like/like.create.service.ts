import { ILikeRepository, LikeCreate } from './repositories/ILikeRepository'
import { IUserRepository } from '../../modules/user/repositories/IUserRepository'
import { ICommentRepository } from '../../modules/comment/repositories/ICommentRepository'

class LikeCreateService {
  constructor(
    private likeRepository: ILikeRepository,
    private userRepository: IUserRepository,
    private commentRepository: ICommentRepository,
  ) {}

  async execute(commentData: LikeCreate) {
    const { commentId, userId } = commentData

    const user = await this.userRepository.findById(userId)

    if (!user) {
      throw new Error('User not found.')
    }

    const comment = await this.commentRepository.findById(commentId)

    if (comment) {
      if (comment.userId === userId) {
        throw new Error('User cannot like their own comment.')
      }

      const alreadyVoted = await this.likeRepository.checkUserVoteForComment(
        comment.id,
        user.id,
      )

      if (alreadyVoted) {
        throw new Error('User has already liked this comment.')
      }

      const createdLike = await this.likeRepository.save({
        commentId: comment.id,
        userId,
      })

      return createdLike
    }

    throw new Error('Comment or reply not found.')
  }
}

export { LikeCreateService }
