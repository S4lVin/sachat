import express from 'express'
import { validator } from '#middlewares'
import { chatController } from '#controllers'
import { createChatSchema, updateChatTitleSchema } from '#schemas'

export const router = express.Router()

router.get('/', chatController.getAllChats)
router.post('/', validator(createChatSchema), chatController.createChat)

router
  .route('/:id')
  .get(chatController.getChat)
  .patch(validator(updateChatTitleSchema), chatController.updateChatTitle)
  .delete(chatController.deleteChat)
