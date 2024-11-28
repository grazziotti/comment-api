import sharp from 'sharp'
import { IRoleRepository } from '../role/repositories/IRoleRepository'
import { IUserRoleRepository } from '../userRole/repositories/IUserRoleRepository'
import { IUserRepository } from './repositories/IUserRepository'
import { hash } from 'bcrypt'
import { v2 as cloudinary } from 'cloudinary'
import path from 'path'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME as string,
  api_key: process.env.CLOUDINARY_KEY as string,
  api_secret: process.env.CLOUDNARY_SECRET as string,
})

class CreateUserService {
  constructor(
    private userRepository: IUserRepository,
    private userRoleRepository: IUserRoleRepository,
    private roleRepository: IRoleRepository,
  ) {}

  public async execute(data: {
    username: string
    password: string
    avatar: Buffer | undefined
  }) {
    const { password, username, avatar } = data

    const user = await this.userRepository.findByUsername(username)
    let avatarRef: string | null = null

    if (user) {
      throw new Error('Username already in use.')
    }

    const passwordHash = await hash(password, 8)

    if (avatar) {
      const processedImage = await sharp(avatar)
        .resize(32, 32)
        .jpeg()
        .toBuffer()

      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'avatars' },
          (error, result) => {
            if (error) reject(error)
            else resolve(result)
          },
        )

        uploadStream.end(processedImage)
      })

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const secureUrl = (uploadResult as any).secure_url
      const fileName = path.basename(new URL(secureUrl).pathname)

      avatarRef = fileName
    }

    const userCreated = await this.userRepository.save({
      username: username.toLocaleLowerCase(),
      password: passwordHash,
      avatar: avatarRef,
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
      avatar: userCreated.avatar === null ? null : userCreated.avatar,
    }
  }
}

export { CreateUserService }
