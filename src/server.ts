import express from 'express'
import routes from '@/routes'
import dotenv from 'dotenv'

const app = express()

dotenv.config()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(routes)

const port = process.env.PORT ? process.env.PORT : 4000

app.listen(port, () => console.log(`Servidor está rodando na porta ${port}`))
