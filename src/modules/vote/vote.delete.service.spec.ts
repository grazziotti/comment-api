import { hash } from 'bcrypt'
import { CommentInMemoryRepository } from '../comment/repositories/CommentInMemoryRepository'
import { UserSave } from '../user/repositories/IUserRepository'
import { UserInMemoryRepository } from '../user/repositories/UserInMemoryRepository'
import { VoteInMemoryRepository } from './repositories/VoteInMemoryRepository'
import { VoteDeleteService } from './vote.delete.service'

let voteInMemoryRepository: VoteInMemoryRepository
let voteDeleteService: VoteDeleteService

let commentInMemoryRepository: CommentInMemoryRepository
let userInMemoryRepository: UserInMemoryRepository
let user: UserSave
let user2: UserSave

beforeEach(async () => {
  voteInMemoryRepository = new VoteInMemoryRepository()
  commentInMemoryRepository = new CommentInMemoryRepository()
  userInMemoryRepository = new UserInMemoryRepository()
  voteDeleteService = new VoteDeleteService(
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

describe('delete vote service', () => {
  it('should delete an existing vote', async () => {
    const comment = {
      content: 'Test content',
      userId: user.id,
      parentId: null,
      replyToId: null,
      replyToUserId: null,
    }

    const createdCommentResult = await commentInMemoryRepository.save(comment)

    const vote = {
      commentId: createdCommentResult.id,
      userId: user2.id,
      voteType: 'upVote',
    }

    const createdVoteResult = await voteInMemoryRepository.save(vote)

    await voteDeleteService.execute({
      userId: user2.id,
      voteId: createdVoteResult.id,
    })

    const result = await voteInMemoryRepository.findById(createdVoteResult.id)

    expect(result).toBe(null)
  })

  it('should throw an error when trying to delete a non-existent vote', async () => {
    await expect(
      voteDeleteService.execute({
        userId: user.id,
        voteId: '123',
      }),
    ).rejects.toEqual(new Error('Vote not found.'))
  })

  it('should not be able to delete a vote from an inactive user', async () => {
    const password = 'TestPassword1234$'
    const passwordHash = await hash(password, 8)

    const user = await userInMemoryRepository.save({
      username: 'user3_test',
      password: passwordHash,
    })

    const comment = {
      content: 'Test content',
      userId: user.id,
      parentId: null,
      replyToId: null,
      replyToUserId: null,
    }

    const createdCommentResult = await commentInMemoryRepository.save(comment)

    const vote = {
      commentId: createdCommentResult.id,
      userId: user2.id,
      voteType: 'upVote',
    }

    const createdVoteResult = await voteInMemoryRepository.save(vote)

    await userInMemoryRepository.delete(user.id)

    await expect(
      voteDeleteService.execute({
        userId: user.id,
        voteId: createdVoteResult.id,
      }),
    ).rejects.toEqual(new Error('User not found.'))
  })
})
