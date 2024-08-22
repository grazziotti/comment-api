import { IUserRepository } from '../user/repositories/IUserRepository'
import { IVoteRepository } from '../vote/repositories/IVoteRepository'
import { ICommentRepository } from './repositories/ICommentRepository'

type CommentDataType = {
  id: string
  content: string
  createdAt: Date
  updatedAt: Date | null
  score: number
  voted: {
    voteId: string | null
    voteType: string | null
  }
  user: {
    username: string
    avatar: string | null
  }
  replies: ReplyDataType[]
}

type ReplyDataType = {
  id: string
  content: string
  createdAt: Date
  updatedAt: Date | null
  score: number
  voted: {
    voteId: string | null
    voteType: string | null
  }
  user: {
    username: string
    avatar: string | null
  }
  replyTo: {
    user: {
      username: string
      avatar: string | null
    }
  }
}

class CommentGetAllPrivateService {
  constructor(
    private commentRepository: ICommentRepository,
    private voteRepository: IVoteRepository,
    private userRepository: IUserRepository,
  ) {}

  public async execute(userId: string) {
    const commentsAndReplies = await this.commentRepository.getAll()

    const user = await this.userRepository.findById(userId)

    if (!user) {
      throw new Error('User not found.')
    }

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
          throw new Error('Comment user not found.')
        }

        const commentReplies = await Promise.all(
          replies
            .filter((reply) => reply.parentId === comment.id)
            .map(async (reply) => {
              const replyUser = await this.userRepository.findById(reply.userId)

              if (!replyUser) {
                throw new Error('User not found.')
              }

              if (reply.replyToUserId === null) {
                throw new Error('User not found.')
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

              const replyVoted = replyVotes.find(
                (replyVote) => replyVote.userId === user.id,
              )

              const replyData: ReplyDataType = {
                id: reply.id,
                content: reply.content,
                createdAt: reply.createdAt,
                updatedAt: reply.updatedAt,
                score: replyUpVotes.length - replyDownVotes.length,
                voted: {
                  voteId: replyVoted ? replyVoted?.id : null,
                  voteType: replyVoted ? replyVoted.voteType : null,
                },
                user: {
                  username: replyUser.username,
                  avatar: replyUser.avatar,
                },
                replyTo: {
                  user: {
                    username: userToReply.username,
                    avatar: userToReply.avatar,
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

        const commentVoted = commentVotes.find(
          (commentVote) => commentVote.userId === user.id,
        )

        const commentData: CommentDataType = {
          id: comment.id,
          content: comment.content,
          createdAt: comment.createdAt,
          updatedAt: comment.updatedAt,
          score: commentUpVotes.length - commentDownVotes.length,
          voted: {
            voteId: commentVoted ? commentVoted.id : null,
            voteType: commentVoted ? commentVoted.voteType : null,
          },
          user: {
            username: commentUser.username,
            avatar: commentUser.avatar,
          },
          replies: commentReplies,
        }

        return commentData
      }),
    )

    return formattedComments
  }
}

export { CommentGetAllPrivateService }
