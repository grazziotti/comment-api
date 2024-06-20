import { prismaClient } from '@/database/client'
import { IRoleRepository, RoleCreate, RoleSave } from './IRoleRepository'

class RolePrismaRepository implements IRoleRepository {
  async save({ name }: RoleCreate): Promise<RoleSave> {
    const role = await prismaClient.role.create({
      data: {
        name,
      },
    })
    return role
  }

  async findById(id: string): Promise<RoleSave | null> {
    const role = await prismaClient.role.findUnique({
      where: {
        id,
      },
    })
    return role
  }

  async findByName(name: string): Promise<RoleSave | null> {
    const role = await prismaClient.role.findUnique({
      where: {
        name,
      },
    })
    return role
  }
}

export { RolePrismaRepository }
