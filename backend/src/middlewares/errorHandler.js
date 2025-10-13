import { AppError } from '#errors'
import { logger } from '#utils'

export const errorHandler = (err, req, res, next) => { // https://claude.ai/chat/68640b41-678f-4c64-92d7-5792790253fb
  logger.error(err)

  let message = 'Errore interno del server'
  let statusCode = 500
  let errorCode = 'INTERNAL_SERVER_ERROR'
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
