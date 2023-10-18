import { IUserRepository, UserCreate } from './repositories/IUserRepository'
import { hash } from 'bcrypt'

class CreateUserService {
  constructor(private userRepository: IUserRepository) {}

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

    return userCreated
  }
}

export { CreateUserService }
