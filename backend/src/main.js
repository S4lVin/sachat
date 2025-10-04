import express from 'express'
import { config } from '#config'
import { CustomError } from '#utils'
import { logger, errorHandler } from '#middlewares'
import { chatsRouter, completionsRouter } from '#routers'

const app = express()

app.listen(config.port, () => {
  console.log(`SaChat backend operative\n\nPort ${config.port}\nEnvironment: ${config.env}`)
})

app.use(express.json())
app.use(logger)

app.use('/api/chats', chatsRouter)
app.use('/api/completions', completionsRouter)

app.use((req, res, next) => {
  const error = new CustomError('Endpoint not found', 404)
  next(error)
})

app.use(errorHandler)
