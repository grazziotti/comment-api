import { IUserRoleRepository } from './repositories/IUserRoleRepository'

class GetUserRolesService {
  constructor(private userRoleRepository: IUserRoleRepository) {}

  public async execute(userId: string) {
    const role = await this.userRoleRepository.findByUserId(userId)

    if (!role) {
      throw new Error('Role not found.')
    }

    return role
  }
}

export { GetUserRolesService }
