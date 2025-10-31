import { AppError } from '../../errors.js'
import { logger } from '../../services/index.js'

export const errorHandler = (err, req, res, next) => {
  const isAppError = err instanceof AppError
  const level = isAppError ? 'warn' : 'error'
  const logMessage = isAppError ? 'app error handled' : 'unexpected error occurred'
  logger[level](
    {
      err,
      userId: req.user?.id,
      requestId: req.id,
    },
    logMessage,
  )

  let message = 'Errore interno del server'
  let statusCode = 500
  let errorCode = 'INTERNAL_SERVER_ERROR'
  let details = undefined

  if (isAppError) {
    message = err.message || message
    statusCode = err.statusCode || statusCode
    errorCode = err.errorCode || errorCode
    details = err.details
  }

  const errorResponse = { message, errorCode }
  if (details) errorResponse.details = details

  const contentType = res.get('Content-Type') || ''
  if (contentType.startsWith('application/x-ndjson')) {
    res.write(JSON.stringify({ type: 'error', data: { error: errorResponse } }) + '\n')
    return res.end()
  }
  return res.status(statusCode).json({ error: errorResponse })
}
