import Joi from 'joi'

const emailMessages = {
  'any.required': "L'email è richiesta",
  'string.email': "L'email non è valida",
  'string.max': "L'email può contenere al massimo 100 caretteri",
}

const passwordMessages = {
  'any.required': 'La password è richiesta',
  'string.min': 'La password deve contenere almeno 8 caratteri',
  'string.max': 'La password può contenere al massimo 50 caratteri',
}

const nameMessages = {
  'any.required': 'Il nome è richiesto',
  'string.min': 'Il nome deve contenere almeno 3 caratteri',
  'string.max': 'Il nome può contenere al massimo 50 caratteri',
}

export const authSchemas = {
  register: Joi.object({
    email: Joi.string().email().max(100).required().messages(emailMessages),
    password: Joi.string().min(8).max(50).required().messages(passwordMessages),
    name: Joi.string().min(3).max(50).required().messages(nameMessages),
  }),

  login: Joi.object({
    email: Joi.string().email().required().messages(emailMessages),
    password: Joi.string().required().messages(passwordMessages),
  }),

  refresh: Joi.object({
    refreshToken: Joi.string().required(),
  }),
}
