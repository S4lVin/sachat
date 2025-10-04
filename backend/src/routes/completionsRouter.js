import express from 'express'
import { completionController } from '#controllers'

export const router = express.Router()

router.post('/', completionController.create)
