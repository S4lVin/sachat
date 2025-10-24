import Joi from 'joi'

const optionsSchema = {
  model: Joi.string().valid('gpt-5', 'gpt-5-mini', 'gpt-5-nano').optional(),
}

export const messageSchemas = {
  reply: Joi.object({
    options: Joi.object(optionsSchema).optional().unknown(false),
  }),

  cancelReply: Joi.object({}),

  create: Joi.object({
    sender: Joi.string().valid('user', 'assistant').required(),
    content: Joi.string().min(1).required(),
  }),
}
