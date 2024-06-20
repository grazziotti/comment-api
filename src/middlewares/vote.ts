import { RolePrismaRepository } from '@/modules/role/repositories/RolePrismaRepository'
import { FindRoleByIdService } from '@/modules/role/role.findById.service'
import { UserSave } from '@/modules/user/repositories/IUserRepository'
import { UserPrismaRepository } from '@/modules/user/repositories/UserPrismaRepository'
import { UserRolePrismaRepository } from '@/modules/userRole/repositories/UserRolePrismaRepository'
import { GetUserRolesService } from '@/modules/userRole/userRole.getUserRoles.service'
import { VoteSave } from '@/modules/vote/repositories/IVoteRepository'

import { VotePrismaRepository } from '@/modules/vote/repositories/VotePrismaRepository'
import { VoteGetService } from '@/modules/vote/vote.get.service'
import { NextFunction, Request, Response } from 'express'

const authVote = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  const user = request.user as UserSave
  const { voteId } = request.params

  // repositories
  const userRolePrismaRepository = new UserRolePrismaRepository()
  const rolePrismaRepository = new RolePrismaRepository()
  const userPrismaRepository = new UserPrismaRepository()
  const votePrismaRepository = new VotePrismaRepository()

  // services
  const voteGetService = new VoteGetService(
    votePrismaRepository,
    userPrismaRepository,
  )
  const findRoleByIdService = new FindRoleByIdService(rolePrismaRepository)
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

  let vote: VoteSave

  try {
    vote = await voteGetService.execute({ id: voteId, userId: user.id })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return response.status(400).json({ error: error.message })
  }

  if (user.id !== vote.userId && !rolesNames.includes('admin')) {
    return response.status(400).json({ error: 'Unauthorized' })
  }

  next()
}

export { authVote }
