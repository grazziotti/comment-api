import { IRoleRepository, RoleCreate } from './repositories/IRoleRepository'

class CreateRoleService {
  constructor(private roleRepository: IRoleRepository) {}

  public async execute(data: RoleCreate) {
    const { name } = data

    const role = await this.roleRepository.findByName(name.toLowerCase())

    if (role) {
      throw new Error('This role already exists.')
    }

    const roleCreated = await this.roleRepository.save({
      name: name.toLowerCase(),
    })

    return {
      id: roleCreated.id,
      name: roleCreated.name,
      createdAt: roleCreated.createdAt,
    }
  }
}

export { CreateRoleService }
