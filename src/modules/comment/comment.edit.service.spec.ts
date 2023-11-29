import { hash } from 'bcrypt'
import { UserSave } from '../user/repositories/IUserRepository'
import { UserInMemoryRepository } from '../user/repositories/UserInMemoryRepository'
import { CommentEditService } from './comment.edit.service'
import { CommentInMemoryRepository } from './repositories/CommentInMemoryRepository'

let commentEditService: CommentEditService
let commentInMemoryRepository: CommentInMemoryRepository
let userInMemoryRepository: UserInMemoryRepository
let user: UserSave
let user2: UserSave

beforeEach(async () => {
  commentInMemoryRepository = new CommentInMemoryRepository()
  commentEditService = new CommentEditService(commentInMemoryRepository)
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

describe('edit comment service', () => {
  it('should be able to edit a comment', async () => {
    const comment = {
      content: 'Test content',
      userId: user.id,
      parentId: null,
      replyToId: null,
    }

    const createdCommentResult = await commentInMemoryRepository.save(comment)

    const editedComment = {
      id: createdCommentResult.id,
      newContent: 'Test content edited',
      userId: user.id,
    }

    const result = await commentEditService.execute(editedComment)

    expect(result.content).toBe('Test content edited')
  })
  it('should not be able to edit a nonexistent comment', async () => {
    const editedComment = {
      id: '123',
      newContent: 'Test content edited',
      userId: user.id,
    }

    await expect(commentEditService.execute(editedComment)).rejects.toEqual(
      new Error('Comment not found.'),
    )
  })
  it('should not be able to edit a comment from another user', async () => {
    const comment = {
      content: 'Test content',
      userId: user.id,
      parentId: null,
      replyToId: null,
    }

    const createdCommentResult = await commentInMemoryRepository.save(comment)

    const editedComment = {
      id: createdCommentResult.id,
      newContent: 'Test content edited',
      userId: user2.id,
    }

    await expect(commentEditService.execute(editedComment)).rejects.toEqual(
      new Error('User is not authorized to edit this comment.'),
    )
  })
})
