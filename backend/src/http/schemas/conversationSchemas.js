import Joi from 'joi'

export const conversationSchemas = {
  getStream: Joi.object({
    messageId: Joi.number().required(),
  }),

  send: Joi.object({
    parentId: Joi.number().optional(),
    chatId: Joi.number().optional(),
    content: Joi.string().min(1).required(),
    options: Joi.object().optional()
  }),

  regenerate: Joi.object({
    messageId: Joi.number().required(),
    options: Joi.object().optional()
  }),

  cancel: Joi.object({
    messageId: Joi.number().required(),
  }),
}
