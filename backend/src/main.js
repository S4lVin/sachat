import 'dotenv/config'
import express from 'express'
import { NotFoundError } from '#errors'
import { logger, httpLogger } from '#utils'
import { rateLimiter, corsHandler, errorHandler, authenticator } from '#middlewares'
import { authRouter, chatsRouter } from '#routers'

const app = express()
const port = process.env.PORT
const env = process.env.NODE_ENV

// Middlewares
app.use(rateLimiter)
app.use(corsHandler)
app.use(express.json())
app.use(httpLogger)

// Aggiunge un ritardo ad ogni richiesta all'API (development only)
const delay = Number(process.env.FAKE_DELAY_MS)
if (env === 'development' && delay !== 0) {
  app.use('/api', async (req, res, next) => {
    await new Promise((r) => setTimeout(r, delay))
    next()
  })
}

// Api
app.use('/api/auth', authRouter)
app.use('/api/chats', authenticator, chatsRouter)
app.use(() => {
  throw new NotFoundError('Endpoint non trovato', 'ENDPOINT_NOT_FOUND')
})

// Error Handler
app.use(errorHandler)

app.listen(port, () => {
  logger.info(
    {
      port,
      env,
    },
    'server listening',
  )
})
