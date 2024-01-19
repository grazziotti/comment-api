export type UserCreate = {
  username: string
  password: string
}

export type UserEdit = {
  id: string
  password: string
}

export type UserSave = {
  id: string
  username: string
  password: string
  createdAt: Date
  deletedAt: Date | null
}

export interface IUserRepository {
  save(data: UserCreate): Promise<UserSave>
  findByUsername(username: string): Promise<UserSave | null>
  findById(id: string): Promise<UserSave | null>
  edit(data: UserEdit): Promise<UserSave>
  delete(id: string): Promise<void>
}
