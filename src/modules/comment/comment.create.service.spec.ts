import { hash } from 'bcrypt'
import { UserSave } from '../user/repositories/IUserRepository'
import { UserInMemoryRepository } from '../user/repositories/UserInMemoryRepository'
import { CommentCreateService } from './comment.create.service'
import { CommentInMemoryRepository } from './repositories/CommentInMemoryRepository'

let commentCreateService: CommentCreateService
let commentInMemoryRepository: CommentInMemoryRepository
let userInMemoryRepository: UserInMemoryRepository
let user: UserSave
let user2: UserSave

beforeEach(async () => {
  commentInMemoryRepository = new CommentInMemoryRepository()
  commentCreateService = new CommentCreateService(commentInMemoryRepository)
  userInMemoryRepository = new UserInMemoryRepository()

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

describe('create comment service', () => {
  it('should be able to create a new comment', async () => {
    const comment = {
      content: 'Test content',
      userId: user.id,
    }

    const result = await commentCreateService.execute(comment)

    expect(result).toHaveProperty('id')
    expect(result).toHaveProperty('createdAt')
    expect(result).toHaveProperty('content')
    expect(result).not.toHaveProperty('reply')
  })
  it('should be able to create a new reply', async () => {
    const comment = {
      content: 'Test content',
      userId: user.id,
    }

    const commentResult = await commentCreateService.execute(comment)

    const reply = {
      content: 'Test reply',
      userId: user2.id,
      replyToId: commentResult.id,
    }

    const result = await commentCreateService.execute(reply)

    expect(result).toHaveProperty('id')
    expect(result).toHaveProperty('createdAt')
    expect(result).toHaveProperty('content')
    expect(result).toHaveProperty('reply')
    expect(result.reply).toBe(true)
  })
  it('should not be able to create a reply to oneself', async () => {
    const comment = {
      content: 'Test content',
      userId: user.id,
    }

    const commentResult = await commentCreateService.execute(comment)

    const reply = {
      content: 'Test reply',
      userId: user.id,
      replyToId: commentResult.id,
    }

    await expect(commentCreateService.execute(reply)).rejects.toEqual(
      new Error('User cannot reply to themselves.'),
    )
  })
  it('should not be able to create a reply to a nonexistent comment', async () => {
    const reply = {
      content: 'Test reply',
      userId: user.id,
      replyToId: '123',
    }

    await expect(commentCreateService.execute(reply)).rejects.toEqual(
      new Error('Comment to reply not found.'),
    )
  })
})
