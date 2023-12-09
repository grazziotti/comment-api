import { hash } from 'bcrypt'
import { IUserRepository, UserEdit } from './repositories/IUserRepository'

class UserEditService {
  constructor(private userRepository: IUserRepository) {}

  public async execute(data: UserEdit) {
    const { id, password } = data

    const user = await this.userRepository.findById(id)

    if (!user || user.deletedAt !== null) {
      throw new Error('User not found.')
    }

    const passwordHash = await hash(password, 8)

    const updatedUser = await this.userRepository.edit({
      id,
      password: passwordHash,
    })

    if (!updatedUser) {
      throw new Error('Was not possible to update user.')
    }

    return {
      id: updatedUser.id,
      username: updatedUser.username,
      createdAt: updatedUser.createdAt,
      deletedAt: updatedUser.deletedAt,
    }
  }
}

export { UserEditService }
