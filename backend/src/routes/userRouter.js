import express from 'express'
import { userController } from '#controllers'

export const userRouter = express.Router()

userRouter.route('/me')
  .get(userController.get)
  .patch(userController.update)
  .delete(userController.delete)