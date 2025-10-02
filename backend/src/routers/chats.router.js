import express from 'express'
import messagesRouter from './messages.router.js'

const router = express.Router()

router.use('/:chatId/messages', messagesRouter)

router.get('/', (req, res) => {
  res.send('List of chats')
})

router.post('/', (req, res) => {
  res.send('Create a new chat')
})

router.route('/:id')
  .get((req, res) => {
    res.send(`Get chat with ID ${req.params.id}`)
  })
  .put((req, res) => {
    res.send(`Update chat with ID ${req.params.id}`)
  })
  .delete((req, res) => {
    res.send(`Delete chat with ID ${req.params.id}`)
  })

export default router