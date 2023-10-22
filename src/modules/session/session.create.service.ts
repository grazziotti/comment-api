import { sign } from 'jsonwebtoken'
import { IUserRepository } from '@/modules/user/repositories/IUserRepository'
import { compare } from 'bcrypt'

interface Request {
  username: string
  password: string
}

class SessionService {
  constructor(private userRepository: IUserRepository) {}

  public async execute({ username, password }: Request) {
    const user = await this.userRepository.findByUsername(username)

    if (!user) {
      throw new Error('Invalid credentials.')
    }

    const passwordCompare = await compare(password, user.password)

    if (!passwordCompare) {
      throw new Error('Invalid credentials.')
    }

    const token = sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET as string,
      {
        expiresIn: '1d',
      },
    )

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
      },
    }
  }
}

export { SessionService }
