import Joi from 'joi'

export const authSchemas = {
  register: Joi.object({
    email: Joi.string().email().max(100).required(),
    password: Joi.string().min(8).max(50).required(),
    name: Joi.string().min(3).max(50).required(),
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),

  refresh: Joi.object({
    refreshToken: Joi.string().required(),
  }),
}
