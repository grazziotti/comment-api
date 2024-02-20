import { RoleCreate } from './repositories/IRoleRepository'
import { RoleInMemoryRepository } from './repositories/RoleInMemoryRepository'
import { CreateRoleService } from './role.create.service'

let createRoleService: CreateRoleService
let roleInMemoryRepository: RoleInMemoryRepository

describe('create role service', () => {
  beforeAll(() => {
    roleInMemoryRepository = new RoleInMemoryRepository()
    createRoleService = new CreateRoleService(roleInMemoryRepository)
  })

  it('should be able to create a new role', async () => {
    const roleData: RoleCreate = { name: 'admin' }

    const result = await createRoleService.execute(roleData)

    expect(result).toHaveProperty('id')
    expect(result).toHaveProperty('name', roleData.name.toLowerCase())
    expect(result).toHaveProperty('createdAt')
  })

  it('should throw an error if the role already exists', async () => {
    const roleData: RoleCreate = { name: 'admin' }

    await roleInMemoryRepository.save(roleData)

    await expect(createRoleService.execute(roleData)).rejects.toThrow(
      'This role already exists.',
    )
  })
})
