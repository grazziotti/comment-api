import { Router } from 'express'
import userRoutes from '@/routes/user'
import commentRoutes from './comment'
import sessionRoutes from './session'
import voteRoutes from './vote'

const routes = Router()
const prefixRoutes = '/api/v1'

routes.get(`${prefixRoutes}/ping`, (request, response) =>
  response.json({ pong: true }),
)

routes.use(`${prefixRoutes}/users`, userRoutes)
routes.use(`${prefixRoutes}/sessions`, sessionRoutes)
routes.use(`${prefixRoutes}/comments`, commentRoutes)
routes.use(`${prefixRoutes}/votes`, voteRoutes)

export default routes
