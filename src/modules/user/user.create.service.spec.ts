import { UserInMemoryRepository } from './repositories/UserInMemoryRepository'
import { CreateUserService } from './user.create.service'

let createUserService: CreateUserService
let userInMemoryRepository: UserInMemoryRepository

describe('create user service', () => {
  beforeAll(() => {
    userInMemoryRepository = new UserInMemoryRepository()
    createUserService = new CreateUserService(userInMemoryRepository)
  })

  it('should be able to create a new user', async () => {
    const user = {
      username: 'user_test',
      password: 'TestPassword1234$',
    }

    const result = await createUserService.execute(user)

    expect(result).toHaveProperty('id')
  })

  it('should not be able to create an existing user', async () => {
    const user = {
      username: 'user_test_existing',
      password: 'TestPassword1234$',
    }

    await createUserService.execute(user)

    await expect(createUserService.execute(user)).rejects.toEqual(
      new Error('Username already in use.'),
    )
  })
})
