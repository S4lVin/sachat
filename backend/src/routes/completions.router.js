import express from 'express'

export const router = express.Router()

router.post('/', (req, res) => {
  res.send('Create a new completion')
})
