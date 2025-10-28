import { BadRequestError } from '#core/errors/appErrors.js'

const MissingRequestBody = () =>
  new BadRequestError('Corpo della richiesta mancante', 'MISSING_REQUEST_BODY')

export const validator = (schema) => (req, res, next) => {
  if (!req.body) throw MissingRequestBody()

  const result = schema.validate(req.body, { abortEarly: false, stripUnknown: true })
  if (result.error) {
    const errors = result.error.details.map((detail) => ({
      field: detail.context?.key,
      message: detail.message,
    }))

    throw new BadRequestError('Richiesta non valida', 'INVALID_REQUEST', errors)
  }

  req.body = result.value
  next()
}
