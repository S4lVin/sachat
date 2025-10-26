import Joi from 'joi'

export const conversationSchemas = {
  send: Joi.object({
    parentId: Joi.number().optional(),
    chatId: Joi.number().optional(),
    content: Joi.string().min(1).required(),
  }),
}
