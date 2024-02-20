import { RoleInMemoryRepository } from './repositories/RoleInMemoryRepository'
import { FindRoleByIdService } from './role.findById.service'

let findRoleByIdService: FindRoleByIdService
let roleInMemoryRepository: RoleInMemoryRepository

describe('Find role by id service', () => {
  beforeAll(async () => {
    roleInMemoryRepository = new RoleInMemoryRepository()
    findRoleByIdService = new FindRoleByIdService(roleInMemoryRepository)
  })

  it('should be able to find an existing role by roleId', async () => {
    const roleCreated = await roleInMemoryRepository.save({ name: 'admin' })

    const result = await findRoleByIdService.execute(roleCreated.id)

    expect(result).toHaveProperty('id')
    expect(result).toHaveProperty('name', roleCreated.name)
    expect(result).toHaveProperty('createdAt')
  })

  it('should not be able to find a non-existent function', async () => {
    await expect(findRoleByIdService.execute('123')).rejects.toThrow(
      'Role not found.',
    )
  })
})
