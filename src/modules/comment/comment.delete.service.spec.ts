import { hash } from 'bcrypt'
import { UserSave } from '../user/repositories/IUserRepository'
import { UserInMemoryRepository } from '../user/repositories/UserInMemoryRepository'
import { CommentDeleteService } from './comment.delete.service'
import { CommentInMemoryRepository } from './repositories/CommentInMemoryRepository'

let commentDeleteService: CommentDeleteService
let commentInMemoryRepository: CommentInMemoryRepository
let userInMemoryRepository: UserInMemoryRepository
let user: UserSave

beforeEach(async () => {
  commentInMemoryRepository = new CommentInMemoryRepository()
  userInMemoryRepository = new UserInMemoryRepository()
  commentDeleteService = new CommentDeleteService(
    commentInMemoryRepository,
    userInMemoryRepository,
  )

  const password = 'TestPassword1234$'

  const passwordHash = await hash(password, 8)

  user = await userInMemoryRepository.save({
    username: 'user1_test',
    password: passwordHash,
    avatar: null,
  })
})

describe('delete comment service', () => {
  it('should be able to delete a comment', async () => {
    const comment = {
      content: 'Test content',
      userId: user.id,
      parentId: null,
      replyToId: null,
      replyToUserId: null,
    }

    const createdCommentResult = await commentInMemoryRepository.save(comment)

    await commentDeleteService.execute({
      id: createdCommentResult.id,
      userId: user.id,
    })

    expect(
      await commentInMemoryRepository.findById(createdCommentResult.id),
    ).toBe(null)
  })
  it('should not be able to delete a nonexistent comment ', async () => {
    const comment = {
      id: '123',
      userId: user.id,
    }
    await expect(commentDeleteService.execute(comment)).rejects.toEqual(
      new Error('Comment not found.'),
    )
  })

  it('should not be able to delete a comment from an inactive user', async () => {
    const password = 'TestPassword1234$'
    const passwordHash = await hash(password, 8)

    const user = await userInMemoryRepository.save({
      username: 'user3_test',
      password: passwordHash,
      avatar: null,
    })

    const comment = {
      content: 'Test content',
      userId: user.id,
      parentId: null,
      replyToId: null,
      replyToUserId: null,
    }

    const createdCommentResult = await commentInMemoryRepository.save(comment)

    await userInMemoryRepository.delete(user.id)

    await expect(
      commentDeleteService.execute({
        id: createdCommentResult.id,
        userId: createdCommentResult.userId,
      }),
    ).rejects.toEqual(new Error('User not found.'))
  })
})
