import { hash } from 'bcrypt'
// import { UserSave } from './repositories/IUserRepository'
import { UserInMemoryRepository } from './repositories/UserInMemoryRepository'
import { UserEditService } from './user.edit.service'

let userEditService: UserEditService
let userInMemoryRepository: UserInMemoryRepository

beforeAll(async () => {
  userInMemoryRepository = new UserInMemoryRepository()
  userEditService = new UserEditService(userInMemoryRepository)
})

describe('edit user service', () => {
  it('should be able to update a user', async () => {
    const password = 'TestPassword1234$'
    const passwordHash = await hash(password, 8)

    const user = await userInMemoryRepository.save({
      username: 'user1',
      password: passwordHash,
    })

    const result = await userEditService.execute({
      id: user.id,
      password: 'Jujuba$1234',
    })

    expect(result).toHaveProperty('id')
  })

  it('should return a error when trying to edit a non-existing user', async () => {
    await expect(
      userEditService.execute({
        id: '123',
        password: 'Jujuba$1234',
      }),
    ).rejects.toEqual(new Error('User not found.'))
  })

  it('should return a error when trying to edit a inactive user', async () => {
    const password = 'TestPassword1234$'
    const passwordHash = await hash(password, 8)

    const user = await userInMemoryRepository.save({
      username: 'user1',
      password: passwordHash,
    })

    await userInMemoryRepository.delete(user.id)

    await expect(
      userEditService.execute({
        id: user.id,
        password: 'Jujuba$1234',
      }),
    ).rejects.toEqual(new Error('User not found.'))
  })
})
