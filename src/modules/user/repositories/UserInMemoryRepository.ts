import { IUserRepository, UserCreate, UserSave } from './IUserRepository'
import { randomUUID } from 'crypto'

class UserInMemoryRepository implements IUserRepository {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  users: UserSave[] = []

  async save(data: UserCreate): Promise<UserSave> {
    const id = randomUUID()
    const createdAt = new Date()

    const user: UserSave = {
      ...data,
      id,
      createdAt,
    }

    this.users.push(user)

    return user
  }
  async findByUsername(username: string): Promise<UserSave | null> {
    const user = this.users.find((user) => user.username === username)
    return user ? user : null
  }
  async findById(id: string): Promise<UserSave | null> {
    const user = this.users.find((user) => user.id === id)
    return user ? user : null
  }
}

export { UserInMemoryRepository }
