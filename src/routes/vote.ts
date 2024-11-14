import { Router } from 'express'
import { VoteController } from '../modules/vote/vote.controller'
import { privateRoute } from '../config/passport'
import {
  createVoteValidation,
  editVoteValidation,
} from '../validators/voteValidator'
import { validateAuth } from '../validators/validateAuth'
import { authVote } from '../middlewares/vote'

const voteRoutes = Router()
const voteController = new VoteController()

voteRoutes.post(
  '/',
  createVoteValidation,
  validateAuth,
  privateRoute,
  voteController.create,
)
voteRoutes.get('/', privateRoute, voteController.getAll)
voteRoutes.get('/:voteId', privateRoute, authVote, voteController.get)
voteRoutes.put(
  '/:voteId',
  privateRoute,
  authVote,
  editVoteValidation,
  validateAuth,
  voteController.edit,
)
voteRoutes.delete('/:voteId', privateRoute, authVote, voteController.delete)

export default voteRoutes
