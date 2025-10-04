import Joi from 'joi'

const messageSchema = Joi.object({
  sender: Joi.string().valid('user', 'ai').required(),
  content: Joi.string().min(1).required(),
})

export const createChatSchema = Joi.object({
  title: Joi.string().min(1).required(),
  messages: Joi.array().items(messageSchema).required(),
})

export const updateChatTitleSchema = Joi.object({
  title: Joi.string().min(1).required(),
})
