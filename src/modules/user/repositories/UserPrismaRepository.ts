import { prismaClient } from '@/database/client'
import {
  IUserRepository,
  UserCreate,
  UserEdit,
  UserSave,
} from './IUserRepository'

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

  async edit(data: UserEdit): Promise<UserSave> {
    const { id, password } = data

    const updatedUser = await prismaClient.user.update({
      where: {
        id,
      },
      data: {
        password,
      },
    })

    return updatedUser
  }

  async delete(id: string): Promise<void> {
    await prismaClient.user.update({
      where: {
        id,
      },
      data: {
        deletedAt: new Date(),
      },
    })
    return
  }
}

export { UserPrismaRepository }
