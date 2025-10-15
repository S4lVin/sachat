import 'dotenv/config'
import express from 'express'
import { NotFoundError } from '#errors'
import { logger, httpLogger } from '#utils'
import { rateLimiter, corsHandler, errorHandler, authenticator } from '#middlewares'
import { authRouter, chatsRouter } from '#routers'

const app = express()
const port = process.env.PORT

app.use(rateLimiter)
app.use(corsHandler)

app.use(express.json())
app.use(httpLogger)

app.use('/api', async (req, res, next) => {
  await new Promise((r) => setTimeout(r, 1500))
  next()
})
app.use('/api/auth', authRouter)
app.use('/api/chats', authenticator, chatsRouter)
app.use(() => {
  throw new NotFoundError('Endpoint non trovato', 'ENDPOINT_NOT_FOUND')
})

app.use(errorHandler)

app.listen(port, () => {
  console.log(`SaChat backend operative\n\nPort ${port}\nEnvironment: ${process.env.NODE_ENV}\n`)
})
