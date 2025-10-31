import express from 'express'
import { validator } from '../middlewares/index.js'
import { userController } from '../controllers/index.js'
import { userSchemas } from '../schemas/index.js'

export const userRouter = express.Router()

userRouter.get('/me', userController.get)
userRouter.patch('/me', validator(userSchemas.update), userController.update)
userRouter.delete('/me', userController.delete)
