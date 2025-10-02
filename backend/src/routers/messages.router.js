import express from 'express'

const router = express.Router()

router.get('/', (req, res) => {
  res.send('List of messages')
})

router.post('/', (req, res) => {
  res.send('Create a new message')
})

router.route('/:id')
  .get((req, res) => {
    res.send(`Get message with ID ${req.params.id}`)
  })
  .put((req, res) => {
    res.send(`Update message with ID ${req.params.id}`)
  })
  .delete((req, res) => {
    res.send(`Delete message with ID ${req.params.id}`)
  })

export default router