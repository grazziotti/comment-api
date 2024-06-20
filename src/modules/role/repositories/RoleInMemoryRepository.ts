import { IRoleRepository, RoleCreate, RoleSave } from './IRoleRepository'
import { randomUUID } from 'crypto'

class RoleInMemoryRepository implements IRoleRepository {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  roles: RoleSave[] = []

  async save(data: RoleCreate): Promise<RoleSave> {
    const { name } = data
    const id = randomUUID()
    const createdAt = new Date()

    const role: RoleSave = {
      id,
      name,
      createdAt,
    }

    this.roles.push(role)

    return role
  }

  async findByName(name: string): Promise<RoleSave | null> {
    const role = this.roles.find((role) => role.name === name)
    return role ? role : null
  }

  async findById(id: string): Promise<RoleSave | null> {
    const role = this.roles.find((role) => role.id === id)
    return role ? role : null
  }
}

export { RoleInMemoryRepository }
