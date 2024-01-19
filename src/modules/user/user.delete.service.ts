import { IUserRepository } from './repositories/IUserRepository'

class UserDeleteService {
  constructor(private userRepository: IUserRepository) {}

  public async execute(id: string) {
    const user = await this.userRepository.findById(id)

    if (!user || user.deletedAt !== null) {
      throw new Error('User not found.')
    }

    await this.userRepository.delete(id)

    return
  }
}

export { UserDeleteService }
