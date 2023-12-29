import { hash } from 'bcrypt'
import { CommentInMemoryRepository } from '../comment/repositories/CommentInMemoryRepository'
import { UserSave } from '../user/repositories/IUserRepository'
import { UserInMemoryRepository } from '../user/repositories/UserInMemoryRepository'
import { VoteInMemoryRepository } from './repositories/VoteInMemoryRepository'
import { VoteGetAllService } from './vote.getAll.service'

let voteInMemoryRepository: VoteInMemoryRepository
let voteGetAllService: VoteGetAllService

let commentInMemoryRepository: CommentInMemoryRepository
let userInMemoryRepository: UserInMemoryRepository
let user: UserSave
let user2: UserSave

beforeEach(async () => {
  voteInMemoryRepository = new VoteInMemoryRepository()
  commentInMemoryRepository = new CommentInMemoryRepository()
  userInMemoryRepository = new UserInMemoryRepository()
  voteGetAllService = new VoteGetAllService(
    voteInMemoryRepository,
    userInMemoryRepository,
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

describe('get all votes service', () => {
  it('should return all votes for a specific user', async () => {
    const comment = {
      content: 'Test content',
      userId: user.id,
      parentId: null,
      replyToId: null,
    }

    const comment2 = {
      content: 'Test content 2',
      userId: user.id,
      parentId: null,
      replyToId: null,
    }

    const createdCommentResult = await commentInMemoryRepository.save(comment)
    const createdComment2Result = await commentInMemoryRepository.save(comment2)

    await voteInMemoryRepository.save({
      commentId: createdCommentResult.id,
      userId: user2.id,
      voteType: 'upVote',
    })

    await voteInMemoryRepository.save({
      commentId: createdComment2Result.id,
      userId: user2.id,
      voteType: 'downVote',
    })

    const result = await voteGetAllService.execute({ userId: user2.id })

    expect(result.length).toBe(2)
    expect(result[0].voteType).toBe('upVote')
    expect(result[0].commentId).toBe(createdCommentResult.id)
    expect(result[1].voteType).toBe('downVote')
    expect(result[1].commentId).toBe(createdComment2Result.id)
  })

  it('should not retrieve votes for a specific user when provided with an invalid userId', async () => {
    await expect(voteGetAllService.execute({ userId: '123' })).rejects.toEqual(
      new Error('User not found.'),
    )
  })

  it('should not return votes from another user', async () => {
    const comment = {
      content: 'Test content',
      userId: user.id,
      parentId: null,
      replyToId: null,
    }

    const createdCommentResult = await commentInMemoryRepository.save(comment)

    await voteInMemoryRepository.save({
      commentId: createdCommentResult.id,
      userId: user2.id,
      voteType: 'upVote',
    })

    await voteInMemoryRepository.save({
      commentId: createdCommentResult.id,
      userId: user.id,
      voteType: 'downVote',
    })

    const result = await voteGetAllService.execute({ userId: user2.id })

    expect(result.length).toBe(1)
    expect(result[0].voteType).toBe('upVote')
    expect(result[0].commentId).toBe(createdCommentResult.id)
  })
})
