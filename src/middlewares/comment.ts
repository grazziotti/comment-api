import { CommentGetService } from '../modules/comment/comment.get.service'
import { CommentPrismaRepository } from '../modules/comment/repositories/CommentPrismaRepository'
import { CommentSave } from '../modules/comment/repositories/ICommentRepository'
import { RolePrismaRepository } from '../modules/role/repositories/RolePrismaRepository'
import { FindRoleByIdService } from '../modules/role/role.findById.service'
import { UserSave } from '../modules/user/repositories/IUserRepository'
import { UserRolePrismaRepository } from '../modules/userRole/repositories/UserRolePrismaRepository'
import { GetUserRolesService } from '../modules/userRole/userRole.getUserRoles.service'
import { NextFunction, Request, Response } from 'express'

const authComment = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  const user = request.user as UserSave
  const { commentId } = request.params

  // repositories
  const userRolePrismaRepository = new UserRolePrismaRepository()
  const rolePrismaRepository = new RolePrismaRepository()
  const commentRepository = new CommentPrismaRepository()

  // services
  const findRoleByIdService = new FindRoleByIdService(rolePrismaRepository)
  const commentGetService = new CommentGetService(commentRepository)
  const getUserRolesService = new GetUserRolesService(userRolePrismaRepository)

  const userRoles = await getUserRolesService.execute(user.id)

  if (userRoles.length <= 0) {
    return response.status(401).json({ error: 'Unauthorized' })
  }

  const roles = await Promise.all(
    userRoles.map(
      async (role) => await findRoleByIdService.execute(role.roleId),
    ),
  )

  const rolesNames = roles.map((role) => role.name)

  let comment: CommentSave

  try {
    comment = await commentGetService.execute(commentId)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return response.status(400).json({ error: error.message })
  }

  if (user.id !== comment.userId && !rolesNames.includes('admin')) {
    return response.status(401).json({ error: 'Unauthorized' })
  }

  next()
}

export { authComment }
