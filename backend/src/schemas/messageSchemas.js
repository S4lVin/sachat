import Joi from 'joi'

export const messageSchemas = {
  create: Joi.object({
    sender: Joi.string().valid('user', 'assistant').required(),
    content: Joi.string().min(1).required(),
  }),
}
