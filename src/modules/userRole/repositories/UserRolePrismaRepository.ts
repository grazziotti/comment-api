import { prismaClient } from '@/database/client'
import {
  IUserRoleRepository,
  UserRoleCreate,
  UserRoleSave,
} from './IUserRoleRepository'

class UserRolePrismaRepository implements IUserRoleRepository {
  async save({ roleId, userId }: UserRoleCreate): Promise<UserRoleSave> {
    const userRole = await prismaClient.userRole.create({
      data: {
        roleId,
        userId,
      },
    })
    return userRole
  }

  async findByUserId(userId: string): Promise<UserRoleSave[]> {
    const userRole = await prismaClient.userRole.findMany({
      where: {
        userId,
      },
    })

    return userRole
  }
}

export { UserRolePrismaRepository }
