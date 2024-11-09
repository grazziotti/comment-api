import { RoleInMemoryRepository } from '../role/repositories/RoleInMemoryRepository'
import { UserRoleInMemoryRepository } from '../userRole/repositories/UserRoleInMemoryRepository'
import { UserInMemoryRepository } from './repositories/UserInMemoryRepository'
import { CreateUserService } from './user.create.service'

let createUserService: CreateUserService
let userInMemoryRepository: UserInMemoryRepository
let userRoleInMemoryRepository: UserRoleInMemoryRepository
let roleInMemoryRepository: RoleInMemoryRepository

describe('create user service', () => {
  beforeAll(async () => {
    userInMemoryRepository = new UserInMemoryRepository()
    userRoleInMemoryRepository = new UserRoleInMemoryRepository()
    roleInMemoryRepository = new RoleInMemoryRepository()
    createUserService = new CreateUserService(
      userInMemoryRepository,
      userRoleInMemoryRepository,
      roleInMemoryRepository,
    )

    await roleInMemoryRepository.save({ name: 'user' })
  })

  it('should be able to create a new user', async () => {
    const user = {
      username: 'user_test',
      password: 'TestPassword1234$',
      avatar: null,
    }

    const result = await createUserService.execute(user)

    expect(result).toHaveProperty('id')
  })

  it('should not be able to create an existing user', async () => {
    const user = {
      username: 'user_test_existing',
      password: 'TestPassword1234$',
      avatar: null,
    }

    await createUserService.execute(user)

    await expect(createUserService.execute(user)).rejects.toEqual(
      new Error('Username already in use.'),
    )
  })
})
