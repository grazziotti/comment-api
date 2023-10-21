export type UserCreate = {
  username: string
  password: string
}

export type UserSave = {
  id: string
  username: string
  password: string
  createdAt: Date
}

export interface IUserRepository {
  save(data: UserCreate): Promise<UserSave>
  findByUsername(username: string): Promise<UserSave | null>
  findById(id: string): Promise<UserSave | null>
}
