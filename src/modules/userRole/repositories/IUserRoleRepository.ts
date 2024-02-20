export type UserRoleCreate = {
  roleId: string
  userId: string
}

export type UserRoleSave = {
  roleId: string
  userId: string
}

export interface IUserRoleRepository {
  save(data: UserRoleCreate): Promise<UserRoleSave>
  findByUserId(userId: string): Promise<UserRoleSave[]>
}
