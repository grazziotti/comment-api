export type RoleCreate = {
  name: string
}

export type RoleSave = {
  id: string
  name: string
  createdAt: Date
}

export interface IRoleRepository {
  save(data: RoleCreate): Promise<RoleSave>
  findByName(name: string): Promise<RoleSave | null>
  findById(id: string): Promise<RoleSave | null>
}
