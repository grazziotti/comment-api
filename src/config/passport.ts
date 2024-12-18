import passport from 'passport'
import { Strategy, ExtractJwt } from 'passport-jwt'
import { NextFunction, Request, Response } from 'express'
import dotenv from 'dotenv'

import { UserPrismaRepository } from '../modules/user/repositories/UserPrismaRepository'
import { FindUserByIdService } from '../modules/user/user.findById.service'
import { UserSave } from '../modules/user/repositories/IUserRepository'

dotenv.config()
const notAuthorizedJson = { status: 403, message: 'Not authorized.' }

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET as string,
}

passport.use(
  new Strategy(jwtOptions, async (payload, done) => {
    try {
      const prismaRepository = new UserPrismaRepository()
      const findUserByIdService = new FindUserByIdService(prismaRepository)

      const user = await findUserByIdService.execute(payload.id)

      if (!user || user.deletedAt !== null) {
        return done(notAuthorizedJson, false)
      }

      return done(null, user)
    } catch (error) {
      console.error('Authentication error:', error)
      return done(notAuthorizedJson, false)
    }
  }),
)

export const privateRoute = (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  passport.authenticate('jwt', (err: Error, user: UserSave) => {
    if (err || !user) {
      return response.status(401).json({ error: 'Invalid token.' })
    }

    request.user = user
    return next()
  })(request, response, next)
}

export default passport
