import { hash } from 'bcrypt'
import { RoleInMemoryRepository } from '../role/repositories/RoleInMemoryRepository'
import { UserInMemoryRepository } from '../user/repositories/UserInMemoryRepository'
import { UserRoleCreate } from './repositories/IUserRoleRepository'
import { UserRoleInMemoryRepository } from './repositories/UserRoleInMemoryRepository'
import { UserRoleCreateService } from './userRole.create.service'
import { UserSave } from '../user/repositories/IUserRepository'
import { RoleSave } from '../role/repositories/IRoleRepository'

let createUserRoleService: UserRoleCreateService
let userRoleInMemoryRepository: UserRoleInMemoryRepository
let userInMemoryRepository: UserInMemoryRepository
let roleInMemoryRepository: RoleInMemoryRepository
let user: UserSave
let role: RoleSave

describe('create userRole service', () => {
  beforeAll(async () => {
    userRoleInMemoryRepository = new UserRoleInMemoryRepository()
    userInMemoryRepository = new UserInMemoryRepository()
    roleInMemoryRepository = new RoleInMemoryRepository()
    createUserRoleService = new UserRoleCreateService(
      userRoleInMemoryRepository,
      userInMemoryRepository,
      roleInMemoryRepository,
    )

    const password = 'TestPassword1234$'

    const passwordHash = await hash(password, 8)

    user = await userInMemoryRepository.save({
      username: 'user1_test',
      password: passwordHash,
      avatar: null,
    })

    role = await roleInMemoryRepository.save({ name: 'user' })
  })

  it('should be able to create a new userRole', async () => {
    const userRoleData: UserRoleCreate = { roleId: role.id, userId: user.id }

    const result = await createUserRoleService.execute(userRoleData)

    expect(result.roleId).toEqual(userRoleData.roleId)
    expect(result.userId).toEqual(userRoleData.userId)
  })

  it('should not be able to create a new userRole if the user does not exist', async () => {
    const userRoleData: UserRoleCreate = { roleId: role.id, userId: '123' }

    await expect(createUserRoleService.execute(userRoleData)).rejects.toThrow(
      'User not found.',
    )
  })

  it('should not be able to create a new userRole if the role does not exist', async () => {
    const userRoleData: UserRoleCreate = { roleId: '123', userId: user.id }

    await expect(createUserRoleService.execute(userRoleData)).rejects.toThrow(
      'Role not found.',
    )
  })

  it('should not be able to create a new userRole if the user already has the role', async () => {
    const userRoleData: UserRoleCreate = { roleId: role.id, userId: user.id }

    await userRoleInMemoryRepository.save(userRoleData)

    await expect(createUserRoleService.execute(userRoleData)).rejects.toThrow(
      'User already has this role.',
    )
  })
})
