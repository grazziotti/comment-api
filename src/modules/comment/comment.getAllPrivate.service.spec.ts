import { hash } from 'bcrypt'
import { UserSave } from '../user/repositories/IUserRepository'
import { UserInMemoryRepository } from '../user/repositories/UserInMemoryRepository'
import { CommentInMemoryRepository } from './repositories/CommentInMemoryRepository'
import { CommentGetAllPrivateService } from './comment.getAllPrivate.service'
import { VoteInMemoryRepository } from '../vote/repositories/VoteInMemoryRepository'

let commentGetAllPrivateService: CommentGetAllPrivateService
let commentInMemoryRepository: CommentInMemoryRepository
let userInMemoryRepository: UserInMemoryRepository
let voteInMemoryRepository: VoteInMemoryRepository
let user: UserSave
let user2: UserSave

beforeEach(async () => {
  commentInMemoryRepository = new CommentInMemoryRepository()
  voteInMemoryRepository = new VoteInMemoryRepository()
  userInMemoryRepository = new UserInMemoryRepository()
  commentGetAllPrivateService = new CommentGetAllPrivateService(
    commentInMemoryRepository,
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

describe('create comment service', () => {
  it('should be able to return a list of comments with replies and score', async () => {
    const comment = {
      content: 'Test content',
      userId: user.id,
      parentId: null,
      replyToId: null,
    }

    const commentResult = await commentInMemoryRepository.save(comment)

    const reply = {
      content: 'Reply test content',
      userId: user2.id,
      parentId: commentResult.id,
      replyToId: commentResult.id,
    }

    await commentInMemoryRepository.save(reply)

    const vote = {
      commentId: commentResult.id,
      voteType: 'upVote',
      userId: user2.id,
    }

    await voteInMemoryRepository.save(vote)

    const commentList = await commentGetAllPrivateService.execute(user2.id)

    expect(commentList[0].content).toBe('Test content')
    expect(commentList[0].score).toBe(1)
    expect(commentList[0].voted).toBe('upVote')
    expect(commentList[0].replies[0].score).toBe(0)
    expect(commentList[0].replies[0].voted).toBe(null)
    expect(commentList[0].replies[0].content).toBe('Reply test content')
  })
  it('should not be able to return a list of comments with a invalid userId', async () => {
    await expect(commentGetAllPrivateService.execute('123')).rejects.toEqual(
      new Error('User not found.'),
    )
  })
})
