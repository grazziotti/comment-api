import { UserSave } from '../user/repositories/IUserRepository'
import { UserInMemoryRepository } from '../user/repositories/UserInMemoryRepository'
import { CommentDeleteService } from './comment.delete.service'
import { CommentInMemoryRepository } from './repositories/CommentInMemoryRepository'

let commentDeleteService: CommentDeleteService
let commentInMemoryRepository: CommentInMemoryRepository
let userInMemoryRepository: UserInMemoryRepository
let user: UserSave
let user2: UserSave

beforeEach(async () => {
  commentInMemoryRepository = new CommentInMemoryRepository()
  commentDeleteService = new CommentDeleteService(commentInMemoryRepository)
  userInMemoryRepository = new UserInMemoryRepository()

  user = await userInMemoryRepository.save({
    username: 'user1_test',
    password: 'TestPassword1234$',
  })

  user2 = await userInMemoryRepository.save({
    username: 'user2_test',
    password: 'TestPassword1234$',
  })
})

describe('delete comment service', () => {
  it('should be able to delete a comment', async () => {
    const comment = {
      content: 'Test content',
      userId: user.id,
      parentId: null,
      replyToId: null,
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
      userId: 'user.id',
    }
    await expect(commentDeleteService.execute(comment)).rejects.toEqual(
      new Error('Comment not found.'),
    )
  })
  it('should not be able to delete a comment from another user', async () => {
    const comment = {
      content: 'Test content',
      userId: user.id,
      parentId: null,
      replyToId: null,
    }

    const createdCommentResult = await commentInMemoryRepository.save(comment)

    await expect(
      commentDeleteService.execute({
        id: createdCommentResult.id,
        userId: user2.id,
      }),
    ).rejects.toEqual(
      new Error('User is not authorized to delete this comment.'),
    )
  })
})