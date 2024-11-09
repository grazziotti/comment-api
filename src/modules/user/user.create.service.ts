import sharp from 'sharp'
import { IRoleRepository } from '../role/repositories/IRoleRepository'
import { IUserRoleRepository } from '../userRole/repositories/IUserRoleRepository'
import { IUserRepository } from './repositories/IUserRepository'
import { hash } from 'bcrypt'
import { v2 as cloudinary } from 'cloudinary'
import { unlink } from 'fs/promises'

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
    avatar: { path: string; filename: string } | null
  }) {
    const { password, username, avatar } = data

    const user = await this.userRepository.findByUsername(username)
    let avatarRef: string | null = null

    if (user) {
      throw new Error('Username already in use.')
    }

    const passwordHash = await hash(password, 8)

    if (avatar) {
      await sharp(avatar.path)
        .resize(32, 32, {
          fit: sharp.fit.fill,
          position: 'bottom',
        })
        .toFormat('jpeg')
        .toFile(`./public/media/${avatar.filename}.jpg`)

      const uploadResult = await cloudinary.uploader.upload(
        './public/media/' + `${avatar.filename}.jpg`,
        { folder: 'avatars' },
      )

      avatarRef = `${uploadResult.display_name}.jpg` as string

      await unlink(avatar.path)
      await unlink(`./public/media/${avatar.filename}.jpg`)
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
