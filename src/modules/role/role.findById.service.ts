import { IRoleRepository } from './repositories/IRoleRepository'

class FindRoleByIdService {
  constructor(private roleRepository: IRoleRepository) {}

  public async execute(roleId: string) {
    const role = await this.roleRepository.findById(roleId)

    if (!role) {
      throw new Error('Role not found.')
    }

    return role
  }
}

export { FindRoleByIdService }
