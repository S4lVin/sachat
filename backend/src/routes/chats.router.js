import express from 'express'
import { chatController } from '#controllers'

export const router = express.Router()

router.get('/', chatController.getAllChats)

router.post('/', chatController.createChat)

router.route('/:id')
  .get(chatController.getChat)
  .put(chatController.updateChat)
  .delete(chatController.deleteChat)
