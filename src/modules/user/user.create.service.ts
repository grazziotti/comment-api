import { IRoleRepository } from '../role/repositories/IRoleRepository'
import { IUserRoleRepository } from '../userRole/repositories/IUserRoleRepository'
import { IUserRepository, UserCreate } from './repositories/IUserRepository'
import { hash } from 'bcrypt'

class CreateUserService {
  constructor(
    private userRepository: IUserRepository,
    private userRoleRepository: IUserRoleRepository,
    private roleRepository: IRoleRepository,
  ) {}

  public async execute(data: UserCreate) {
    const { password, username } = data

    const user = await this.userRepository.findByUsername(username)

    if (user) {
      throw new Error('Username already in use.')
    }

    const passwordHash = await hash(password, 8)

    const userCreated = await this.userRepository.save({
      username: username.toLocaleLowerCase(),
      password: passwordHash,
    })

    const role = await this.roleRepository.findByName('user')

    if (!role) {
      throw new Error('Role not found.')
    }

    await this.userRoleRepository.save({
      roleId: role.id,
      userId: userCreated.id,
    })

    return {
      id: userCreated.id,
      username: userCreated.username,
      createdAt: userCreated.createdAt,
      deletedAt: userCreated.deletedAt,
    }
  }
}

export { CreateUserService }
