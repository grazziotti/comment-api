import { IUserRepository } from '../user/repositories/IUserRepository'
import { IVoteRepository } from '../vote/repositories/IVoteRepository'
import { ICommentRepository } from './repositories/ICommentRepository'

type CommentDataType = {
  id: string
  content: string
  createdAt: Date
  updatedAt: Date | null
  score: number
  user: {
    username: string
  }
  replies: ReplyDataType[]
}

type ReplyDataType = {
  id: string
  content: string
  createdAt: Date
  updatedAt: Date | null
  score: number
  user: {
    username: string
  }
  replyTo: {
    user: {
      username: string
    }
  }
}

class CommentGetAllPublicService {
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

              if (!reply.replyToUserId) {
                throw new Error('User to reply not found.')
              }

              const userToReply = await this.userRepository.findById(
                reply.replyToUserId,
              )

              if (!userToReply) {
                throw new Error('User not found.')
              }

              const replyVotes = await this.voteRepository.findVotesByCommentId(
                reply.id,
              )

              const replyUpVotes = replyVotes.filter(
                (replyVote) => replyVote.voteType === 'upVote',
              )

              const replyDownVotes = replyVotes.filter(
                (replyVote) => replyVote.voteType === 'downVote',
              )

              const replyData: ReplyDataType = {
                id: reply.id,
                content: reply.content,
                createdAt: reply.createdAt,
                updatedAt: reply.updatedAt,
                score: replyUpVotes.length - replyDownVotes.length,
                user: {
                  username: replyUser.username,
                },
                replyTo: {
                  user: {
                    username: userToReply.username,
                  },
                },
              }

              return replyData
            }),
        )

        const commentVotes = await this.voteRepository.findVotesByCommentId(
          comment.id,
        )

        const commentUpVotes = commentVotes.filter(
          (commentVote) => commentVote.voteType === 'upVote',
        )

        const commentDownVotes = commentVotes.filter(
          (commentVote) => commentVote.voteType === 'downVote',
        )

        const commentData: CommentDataType = {
          id: comment.id,
          content: comment.content,
          createdAt: comment.createdAt,
          updatedAt: comment.updatedAt,
          score: commentUpVotes.length - commentDownVotes.length,
          user: {
            username: commentUser.username,
          },
          replies: commentReplies,
        }

        return commentData
      }),
    )

    return formattedComments
  }
}

export { CommentGetAllPublicService }
