import express from 'express'
import routes from '@/routes'

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(routes)

const port = 4000

app.listen(port, () => console.log(`Servidor está rodando na porta ${port}`))
