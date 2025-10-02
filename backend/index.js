import express from 'express'
import logger from './middlewares/logger.js'
import chatsRouter from './routers/chats.router.js'
import completionsRouter from './routers/completions.router.js'

const app = express()
const port = 3000

app.use(logger)

app.get('/', (req, res) => {
  res.send('Welcome to the SaChat backend!')
})

app.use('/api/chats', chatsRouter)
app.use('/api/completions', completionsRouter)

app.listen(port, () => {
  console.log(`SaChat backend listening on port ${port}`)
})