import { prismaClient } from '@/database/client'
import { IUserRepository, UserCreate, UserSave } from './IUserRepository'

class UserPrismaRepository implements IUserRepository {
  async save({ username, password }: UserCreate): Promise<UserSave> {
    const user = await prismaClient.user.create({
      data: {
        username,
        password,
      },
    })
    return user
  }
  async findByUsername(username: string): Promise<UserSave | null> {
    const user = await prismaClient.user.findUnique({
      where: {
        username,
      },
    })
    return user
  }
  async findById(id: string): Promise<UserSave | null> {
    const user = await prismaClient.user.findUnique({
      where: {
        id,
      },
    })
    return user
  }
}

export { UserPrismaRepository }
