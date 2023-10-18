import { Router } from 'express'
import userRoutes from '@/routes/user'

const routes = Router()
const prefixRoutes = '/api/v1'

routes.get('/ping', (request, response) => response.json({ pong: true }))

routes.use(`${prefixRoutes}/users`, userRoutes)

export default routes
