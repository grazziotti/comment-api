import { IRoleRepository } from '../role/repositories/IRoleRepository'
import { IUserRepository } from '../user/repositories/IUserRepository'
import {
  IUserRoleRepository,
  UserRoleCreate,
} from './repositories/IUserRoleRepository'

class UserRoleCreateService {
  constructor(
    private userRoleRepository: IUserRoleRepository,
    private userRepository: IUserRepository,
    private roleRepository: IRoleRepository,
  ) {}

  public async execute(data: UserRoleCreate) {
    const { roleId, userId } = data

    const user = await this.userRepository.findById(userId)

    if (!user) {
      throw new Error('User not found.')
    }

    const role = await this.roleRepository.findById(roleId)

    if (!role) {
      throw new Error('Role not found.')
    }

    const userRoles = await this.userRoleRepository.findByUserId(user.id)

    const userRolesArray = userRoles.map((userRole) => userRole.roleId)

    if (userRolesArray.includes(role.id)) {
      throw new Error('User already has this role.')
    }

    const userRole = await this.userRoleRepository.save({ roleId, userId })

    return {
      roleId: userRole.roleId,
      userId: userRole.userId,
      user: user.username,
      role: role.name,
    }
  }
}

export { UserRoleCreateService }
