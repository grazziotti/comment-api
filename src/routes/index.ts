import { Router } from 'express'
import userRoutes from '@/routes/user'
import sessionRoutes from './session'

const routes = Router()
const prefixRoutes = '/api/v1'

routes.get('/ping', (request, response) => response.json({ pong: true }))

routes.use(`${prefixRoutes}/users`, userRoutes)
routes.use(`${prefixRoutes}/sessions`, sessionRoutes)

export default routes
