import { hash } from 'bcrypt'
import { RoleInMemoryRepository } from '../role/repositories/RoleInMemoryRepository'
import { UserInMemoryRepository } from '../user/repositories/UserInMemoryRepository'
import { UserRoleCreate } from './repositories/IUserRoleRepository'
import { UserRoleInMemoryRepository } from './repositories/UserRoleInMemoryRepository'
import { UserSave } from '../user/repositories/IUserRepository'
import { RoleSave } from '../role/repositories/IRoleRepository'
import { GetUserRolesService } from './userRole.getUserRoles.service'

let getUserRolesService: GetUserRolesService
let userRoleInMemoryRepository: UserRoleInMemoryRepository
let userInMemoryRepository: UserInMemoryRepository
let roleInMemoryRepository: RoleInMemoryRepository
let user: UserSave
let role: RoleSave

describe('get userRole service', () => {
  beforeAll(async () => {
    userRoleInMemoryRepository = new UserRoleInMemoryRepository()
    userInMemoryRepository = new UserInMemoryRepository()
    roleInMemoryRepository = new RoleInMemoryRepository()
    getUserRolesService = new GetUserRolesService(userRoleInMemoryRepository)

    const password = 'TestPassword1234$'

    const passwordHash = await hash(password, 8)

    user = await userInMemoryRepository.save({
      username: 'user1_test',
      password: passwordHash,
    })

    role = await roleInMemoryRepository.save({ name: 'user' })
  })

  it('should be able to get a userRole by the user id', async () => {
    const userRoleData: UserRoleCreate = { roleId: role.id, userId: user.id }

    const userRoleCreated = await userRoleInMemoryRepository.save(userRoleData)

    const result = await getUserRolesService.execute(user.id)

    expect(result[0].userId).toBe(userRoleCreated.userId)
    expect(result[0].roleId).toBe(userRoleCreated.roleId)
  })
})
