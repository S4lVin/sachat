import express from 'express'
import { CustomError } from '#utils'
import { errorHandler, authenticator, requestLogger } from '#middlewares'
import { authRouter, chatsRouter, completionsRouter } from '#routers'

const app = express()
const port = process.env.PORT

app.listen(port, () => {
  console.log(`SaChat backend operative\n\nPort ${port}\nEnvironment: ${process.env.NODE_ENV}`)
})

app.use(express.json())
app.use(requestLogger)

app.use('/auth', authRouter)
app.use('/api/chats', authenticator, chatsRouter)
app.use('/api/completions', authenticator, completionsRouter)

app.use(() => {
  throw new CustomError(404)
})

app.use(errorHandler)
