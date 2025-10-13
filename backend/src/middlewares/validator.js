import { BadRequestError } from '#errors'

export const validator = (schema) => (req, res, next) => {
  if (!req.body) throw new BadRequestError('Corpo della richiesta mancante', 'MISSING_REQUEST_BODY')

  const result = schema.validate(req.body, { abortEarly: false })

  if (result.error) {
    const errors = result.error.details.map((detail) => ({
      field: detail.context?.key,
      message: detail.message,
    }))

    throw new BadRequestError('Richiesta non valida', 'INVALID_REQUEST', errors)
  }

  req.validatedBody = result.value
  next()
}
