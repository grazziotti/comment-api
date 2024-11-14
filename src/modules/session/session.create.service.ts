import { sign } from 'jsonwebtoken'
import { IUserRepository } from '../../modules/user/repositories/IUserRepository'
import { compare } from 'bcrypt'
import { IUserRoleRepository } from '../userRole/repositories/IUserRoleRepository'
import { IRoleRepository } from '../role/repositories/IRoleRepository'

interface Request {
  username: string
  password: string
}

class SessionService {
  constructor(
    private userRepository: IUserRepository,
    private userRoleRepository: IUserRoleRepository,
    private roleRepository: IRoleRepository,
  ) {}

  public async execute({ username, password }: Request) {
    const user = await this.userRepository.findByUsername(username)

    if (!user || user.deletedAt !== null) {
      throw new Error('Invalid credentials.')
    }

    const passwordCompare = await compare(password, user.password)

    if (!passwordCompare) {
      throw new Error('Invalid credentials.')
    }

    const roleList = await this.userRoleRepository.findByUserId(user.id)

    const roleIdList = roleList.map((role) => role.roleId)

    const roles = await Promise.all(
      roleIdList.map(
        async (roleId) => await this.roleRepository.findById(roleId),
      ),
    )

    const roleNames = roles.map((role) => role?.name)

    const isAdmin = roleNames.includes('admin')

    const token = sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET as string,
      {
        expiresIn: '30d',
      },
    )

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        avatar: user.avatar,
        role: isAdmin ? 'admin' : 'user',
      },
    }
  }
}

export { SessionService }
