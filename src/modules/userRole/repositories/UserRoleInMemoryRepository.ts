import {
  IUserRoleRepository,
  UserRoleCreate,
  UserRoleSave,
} from './IUserRoleRepository'

class UserRoleInMemoryRepository implements IUserRoleRepository {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  userRoles: UserRoleSave[] = []

  async save(data: UserRoleCreate): Promise<UserRoleSave> {
    const { roleId, userId } = data

    const userRole: UserRoleSave = {
      roleId,
      userId,
    }

    this.userRoles.push(userRole)

    return userRole
  }

  async findByUserId(userId: string): Promise<UserRoleSave[]> {
    const userRole = this.userRoles.filter(
      (userRole) => userRole.userId === userId,
    )
    return userRole
  }
}

export { UserRoleInMemoryRepository }
