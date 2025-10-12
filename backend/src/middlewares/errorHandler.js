import { AppError, logger } from '#utils'

export const errorHandler = (err, req, res, next) => {
  logger.error(err)

  let message = 'Errore sconosciuto'
  let statusCode = 500
  let errorCode = 'UNKNOWN_ERROR'
  let details = undefined

  if (err instanceof AppError) {
    message = err.message || message
    statusCode = err.statusCode || statusCode
    errorCode = err.errorCode || errorCode
    details = err.details
  }

  const errorResponse = { message, errorCode }
  if (details) errorResponse.details = details

  res.status(statusCode).json({ error: errorResponse })
}
