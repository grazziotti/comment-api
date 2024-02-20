import { hash } from 'bcrypt'
import { UserInMemoryRepository } from './repositories/UserInMemoryRepository'
import { UserDeleteService } from './user.delete.service'

let userDeleteService: UserDeleteService
let userInMemoryRepository: UserInMemoryRepository

beforeAll(async () => {
  userInMemoryRepository = new UserInMemoryRepository()
  userDeleteService = new UserDeleteService(userInMemoryRepository)
})

describe('delete user service', () => {
  it('should be able to delete a user', async () => {
    const password = 'TestPassword1234$'
    const passwordHash = await hash(password, 8)

    const user = await userInMemoryRepository.save({
      username: 'user1',
      password: passwordHash,
    })

    await userDeleteService.execute(user.id)

    const deletedUser = await userInMemoryRepository.findById(user.id)

    expect(deletedUser).toHaveProperty('deletedAt')
    expect(deletedUser?.deletedAt).not.toBe(null)
  })

  it('should return a error when trying to delete a non-existing user', async () => {
    await expect(userDeleteService.execute('123')).rejects.toEqual(
      new Error('User not found.'),
    )
  })
})
