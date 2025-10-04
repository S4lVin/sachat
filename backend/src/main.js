import express from 'express'
import { logger, errorHandler } from '#middlewares'
import { authRouter, chatsRouter, completionsRouter } from '#routers'

const app = express()
const port = process.env.PORT

app.listen(port, () => {
  console.log(`SaChat backend operative\n\nPort ${port}\nEnvironment: ${process.env.NODE_ENV}`)
})

app.use(express.json())
app.use(logger)

app.use('/auth', authRouter)
app.use('/api/chats', chatsRouter)
app.use('/api/completions', completionsRouter)

app.use(() => {
  throw Object.assign(new Error(), { statusCode: 404 })
})

app.use(errorHandler)
