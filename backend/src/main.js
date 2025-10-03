import express from 'express'
import { logger } from '#middlewares'
import { chatsRouter, completionsRouter } from '#routers'

const app = express()
const port = 3000

app.use(express.json())
app.use(logger)

app.get('/', (req, res) => {
  res.send('Welcome to the SaChat backend!')
})

app.use('/api/chats', chatsRouter)
app.use('/api/completions', completionsRouter)

app.listen(port, () => {
  console.log(`SaChat backend listening on port ${port}`)
})