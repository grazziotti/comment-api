import { hash } from 'bcrypt'
import { CommentInMemoryRepository } from '../comment/repositories/CommentInMemoryRepository'
import { UserSave } from '../user/repositories/IUserRepository'
import { UserInMemoryRepository } from '../user/repositories/UserInMemoryRepository'
import { VoteInMemoryRepository } from './repositories/VoteInMemoryRepository'
import { VoteCreateService } from './vote.create.service'

let voteInMemoryRepository: VoteInMemoryRepository
let voteCreateService: VoteCreateService

let commentInMemoryRepository: CommentInMemoryRepository
let userInMemoryRepository: UserInMemoryRepository
let user: UserSave
let user2: UserSave

beforeEach(async () => {
  voteInMemoryRepository = new VoteInMemoryRepository()
  commentInMemoryRepository = new CommentInMemoryRepository()
  userInMemoryRepository = new UserInMemoryRepository()
  voteCreateService = new VoteCreateService(
    voteInMemoryRepository,
    commentInMemoryRepository,
  )

  const password = 'TestPassword1234$'

  const passwordHash = await hash(password, 8)

  user = await userInMemoryRepository.save({
    username: 'user1_test',
    password: passwordHash,
  })

  user2 = await userInMemoryRepository.save({
    username: 'user2_test',
    password: passwordHash,
  })
})

describe('create vote service', () => {
  it('should be able to create an upvote for a comment', async () => {
    const comment = {
      content: 'Test content',
      userId: user.id,
      parentId: null,
      replyToId: null,
      replyToUserId: null,
    }

    const createdCommentResult = await commentInMemoryRepository.save(comment)

    const result = await voteCreateService.execute({
      commentId: createdCommentResult.id,
      userId: user2.id,
      voteType: 'upVote',
    })

    expect(result).toHaveProperty('id')
    expect(result).toHaveProperty('voteType')
    expect(result.voteType).toBe('upVote')
  })

  it('should be able to create a downvote for a comment', async () => {
    const comment = {
      content: 'Test content',
      userId: user.id,
      parentId: null,
      replyToId: null,
      replyToUserId: null,
    }

    const createdCommentResult = await commentInMemoryRepository.save(comment)

    const result = await voteCreateService.execute({
      commentId: createdCommentResult.id,
      userId: user2.id,
      voteType: 'downVote',
    })

    expect(result).toHaveProperty('id')
    expect(result).toHaveProperty('voteType')
    expect(result.voteType).toBe('downVote')
  })

  it('should not be able to create a vote for a nonexistent comment', async () => {
    await expect(
      voteCreateService.execute({
        commentId: '123',
        userId: user2.id,
        voteType: 'upVote',
      }),
    ).rejects.toEqual(new Error('Comment or reply not found.'))
  })

  it('should not be able to create a vote for a comment with an invalid voteType', async () => {
    const comment = {
      content: 'Test content',
      userId: user.id,
      parentId: null,
      replyToId: null,
      replyToUserId: null,
    }

    const createdCommentResult = await commentInMemoryRepository.save(comment)

    await expect(
      voteCreateService.execute({
        commentId: createdCommentResult.id,
        userId: user2.id,
        voteType: 'invalidVoteType',
      }),
    ).rejects.toEqual(new Error('Invalid voteType.'))
  })

  it('should not be able to create a vote if the user is the author of the comment', async () => {
    const comment = {
      content: 'Test content',
      userId: user.id,
      parentId: null,
      replyToId: null,
      replyToUserId: null,
    }

    const createdCommentResult = await commentInMemoryRepository.save(comment)

    await expect(
      voteCreateService.execute({
        commentId: createdCommentResult.id,
        userId: user.id,
        voteType: 'upVote',
      }),
    ).rejects.toEqual(new Error('User cannot vote their own comment.'))
  })

  it('should not be able to create a duplicate vote for the same comment by the same user', async () => {
    const comment = {
      content: 'Test content',
      userId: user.id,
      parentId: null,
      replyToId: null,
      replyToUserId: null,
    }

    const createdCommentResult = await commentInMemoryRepository.save(comment)

    await voteCreateService.execute({
      commentId: createdCommentResult.id,
      userId: user2.id,
      voteType: 'upVote',
    })

    await expect(
      voteCreateService.execute({
        commentId: createdCommentResult.id,
        userId: user2.id,
        voteType: 'upVote',
      }),
    ).rejects.toEqual(new Error('User has already voted this comment.'))
  })
})
