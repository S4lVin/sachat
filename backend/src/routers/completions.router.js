import express from 'express'

const router = express.Router()

router.post('/', (req, res) => {
  res.send('Create a new completion')
})

export default router