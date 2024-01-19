import { Router } from 'express'
import { VoteController } from '@/modules/vote/vote.controller'
import { privateRoute } from '@/config/passport'
import {
  createVoteValidation,
  editVoteValidation,
} from '@/validators/voteValidator'
import { validateAuth } from '@/validators/validateAuth'

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
voteRoutes.get('/:id', privateRoute, voteController.get)
voteRoutes.put(
  '/:id',
  editVoteValidation,
  validateAuth,
  privateRoute,
  voteController.edit,
)
voteRoutes.delete('/:id', privateRoute, voteController.delete)

export default voteRoutes
