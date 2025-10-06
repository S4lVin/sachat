import express from 'express'
import cors from 'cors'
import { CustomError } from '#utils'
import { errorHandler, authenticator, requestLogger } from '#middlewares'
import { authRouter, chatsRouter, completionsRouter } from '#routers'

const app = express()
const port = process.env.PORT

app.use(cors({
  origin: process.env.FRONTEND_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}))

app.use(express.json())
app.use(requestLogger)

app.use('/api/auth', authRouter)
app.use('/api/chats', authenticator, chatsRouter)
app.use('/api/completions', authenticator, completionsRouter)

app.use(() => {
  throw new CustomError(404)
})

app.use(errorHandler)

app.listen(port, () => {
  console.log(`SaChat backend operative\n\nPort ${port}\nEnvironment: ${process.env.NODE_ENV}`)
})