import { hash } from 'bcrypt'
import { CommentInMemoryRepository } from '../comment/repositories/CommentInMemoryRepository'
import { UserSave } from '../user/repositories/IUserRepository'
import { UserInMemoryRepository } from '../user/repositories/UserInMemoryRepository'
import { VoteInMemoryRepository } from './repositories/VoteInMemoryRepository'
import { VoteEditService } from './vote.edit.service'

let voteInMemoryRepository: VoteInMemoryRepository
let voteEditService: VoteEditService

let commentInMemoryRepository: CommentInMemoryRepository
let userInMemoryRepository: UserInMemoryRepository
let user: UserSave
let user2: UserSave

beforeEach(async () => {
  voteInMemoryRepository = new VoteInMemoryRepository()
  commentInMemoryRepository = new CommentInMemoryRepository()
  userInMemoryRepository = new UserInMemoryRepository()
  voteEditService = new VoteEditService(voteInMemoryRepository)

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

describe('edit vote service', () => {
  it('should be able to edit a vote', async () => {
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

    const updatedVoteResult = await voteEditService.execute({
      userId: user2.id,
      voteId: createdVoteResult.id,
      voteType: 'downVote',
    })

    expect(updatedVoteResult).toHaveProperty('id')
    expect(updatedVoteResult.voteType).toBe('downVote')
  })

  it('should not be able to edit a nonexistent vote', async () => {
    await expect(
      voteEditService.execute({
        userId: user2.id,
        voteId: '123',
        voteType: 'downVote',
      }),
    ).rejects.toEqual(new Error('Vote not found.'))
  })

  it('should not be able to edit a vote with a invalid voteType', async () => {
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

    await expect(
      voteEditService.execute({
        userId: user2.id,
        voteId: createdVoteResult.id,
        voteType: 'invalid',
      }),
    ).rejects.toEqual(new Error('Invalid voteType.'))
  })
})
