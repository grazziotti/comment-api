import { hash } from 'bcrypt'
import { CommentInMemoryRepository } from '../comment/repositories/CommentInMemoryRepository'
import { UserSave } from '../user/repositories/IUserRepository'
import { UserInMemoryRepository } from '../user/repositories/UserInMemoryRepository'
import { VoteInMemoryRepository } from './repositories/VoteInMemoryRepository'
import { VoteGetService } from './vote.get.service'

let voteInMemoryRepository: VoteInMemoryRepository
let voteGetService: VoteGetService

let commentInMemoryRepository: CommentInMemoryRepository
let userInMemoryRepository: UserInMemoryRepository
let user: UserSave
let user2: UserSave

beforeEach(async () => {
  voteInMemoryRepository = new VoteInMemoryRepository()
  commentInMemoryRepository = new CommentInMemoryRepository()
  userInMemoryRepository = new UserInMemoryRepository()
  voteGetService = new VoteGetService(
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

describe('get vote service', () => {
  it('should return vote', async () => {
    const comment = {
      content: 'Test content',
      userId: user.id,
      parentId: null,
      replyToId: null,
      replyToUserId: null,
    }

    const createdCommentResult = await commentInMemoryRepository.save(comment)

    const createdVoteResult = await voteInMemoryRepository.save({
      commentId: createdCommentResult.id,
      userId: user2.id,
      voteType: 'upVote',
    })

    const result = await voteGetService.execute({
      id: createdVoteResult.id,
      userId: user2.id,
    })

    expect(result.userId).toBe(user2.id)
    expect(result.commentId).toBe(createdCommentResult.id)
    expect(result.voteType).toBe('upVote')
  })

  it('should not retrieve vote when provided with an invalid userId', async () => {
    const comment = {
      content: 'Test content',
      userId: user.id,
      parentId: null,
      replyToId: null,
      replyToUserId: null,
    }

    const createdCommentResult = await commentInMemoryRepository.save(comment)

    const createdVoteResult = await voteInMemoryRepository.save({
      commentId: createdCommentResult.id,
      userId: user2.id,
      voteType: 'upVote',
    })

    await expect(
      voteGetService.execute({ id: createdVoteResult.id, userId: '123' }),
    ).rejects.toEqual(new Error('User not found.'))
  })

  it('should not retrieve vote when provided with an invalid voteId', async () => {
    await expect(
      voteGetService.execute({ id: '123', userId: user2.id }),
    ).rejects.toEqual(new Error('Vote not found.'))
  })
})
