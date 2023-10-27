import { Router } from 'express'
import { VoteController } from '@/modules/vote/vote.controller'
import { privateRoute } from '@/config/passport'

const voteRoutes = Router()
const voteController = new VoteController()

voteRoutes.post('/', privateRoute, voteController.create)
voteRoutes.delete('/:id', privateRoute, voteController.delete)

export default voteRoutes
