import { IUserRepository } from '../user/repositories/IUserRepository'
import { IVoteRepository } from '../vote/repositories/IVoteRepository'
import { ICommentRepository } from './repositories/ICommentRepository'

class CommentGetAllService {
  constructor(
    private commentRepository: ICommentRepository,
    private voteRepository: IVoteRepository,
    private userRepository: IUserRepository,
  ) {}

  public async execute() {
    const commentsAndReplies = await this.commentRepository.getAll()

    const comments = commentsAndReplies.filter(
      (comment) => comment.parentId === null,
    )

    const replies = commentsAndReplies.filter(
      (comment) => comment.parentId !== null,
    )

    const formattedComments = await Promise.all(
      comments.map(async (comment) => {
        const commentUser = await this.userRepository.findById(comment.userId)

        if (!commentUser) {
          throw new Error('User not found.')
        }

        const commentReplies = await Promise.all(
          replies
            .filter((reply) => reply.parentId === comment.id)
            .map(async (reply) => {
              const replyUser = await this.userRepository.findById(reply.userId)

              if (!replyUser) {
                throw new Error('User not found.')
              }

              if (reply.replyToId === null) {
                throw new Error('Invalid reply.')
              }

              const commentToReply = await this.commentRepository.findById(
                reply.replyToId,
              )

              if (!commentToReply) {
                throw new Error('Comment not found.')
              }

              const userToReply = await this.userRepository.findById(
                commentToReply.userId,
              )

              if (!userToReply) {
                throw new Error('User not found.')
              }

              const replyVotes = await this.voteRepository.findVotesByCommentId(
                reply.id,
              )

              const replyUpVotes = replyVotes.filter(
                (commentVote) => commentVote.voteType === 'upVote',
              )

              return {
                id: reply.id,
                content: reply.content,
                createdAt: reply.createdAt,
                updatedAt: reply.updatedAt,
                score: replyUpVotes.length,
                isUserActive: replyUser.deletedAt ? true : false,
                user: {
                  username:
                    replyUser.deletedAt !== null
                      ? '(inactive user)'
                      : replyUser.username,
                },
                replyTo: {
                  user: {
                    username: userToReply.username,
                  },
                },
              }
            }),
        )

        const commentVotes = await this.voteRepository.findVotesByCommentId(
          comment.id,
        )

        const commentUpVotes = commentVotes.filter(
          (commentVote) => commentVote.voteType === 'upVote',
        )

        return {
          id: comment.id,
          content: comment.content,
          createdAt: comment.createdAt,
          updatedAt: comment.updatedAt,
          score: commentUpVotes.length,
          isUserActive: commentUser.deletedAt ? true : false,
          user: {
            username:
              commentUser.deletedAt !== null
                ? '(inactive user)'
                : commentUser.username,
          },
          replies: commentReplies,
        }
      }),
    )

    return formattedComments
  }
}

export { CommentGetAllService }
