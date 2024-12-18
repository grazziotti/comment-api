import { IUserRepository } from './repositories/IUserRepository'

class FindUserByIdService {
  constructor(private userRepository: IUserRepository) {}

  public async execute(id: string) {
    const user = await this.userRepository.findById(id)

    if (!user) {
      return null
    }

    return user
  }
}

export { FindUserByIdService }
