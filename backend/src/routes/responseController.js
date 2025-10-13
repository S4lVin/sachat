import express from 'express'
import { responseController } from '#controllers'

export const responseRouter = express.Router()

responseRouter.post('/', responseController.create)
