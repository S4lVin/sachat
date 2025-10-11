import express from 'express'
import { responseController } from '#controllers'

export const router = express.Router()

router.post('/', responseController.create)
