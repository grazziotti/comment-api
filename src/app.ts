import express, { ErrorRequestHandler } from 'express'
import routes from './routes'
import swaggerUi from 'swagger-ui-express'
import swaggerDocs from './swagger.json'
import cors from 'cors'
import { MulterError } from 'multer'

const app = express()

const errorHandler: ErrorRequestHandler = (err, req, res) => {
  res.status(400)

  if (err instanceof MulterError) {
    res.json({ error: err.code })
  } else {
    console.log(err)
    res.json({ error: 'An error has occurred.' })
  }
}

app.use(
  cors({
    origin: ['https://comment-app-azure.vercel.app/', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs))
app.use(routes)
app.use(errorHandler)

export { app }
