export class AppError extends Error {
  constructor({ message, statusCode, errorCode, details }) {
    super(message)
    this.name = 'AppError'
    this.statusCode = statusCode
    this.errorCode = errorCode
    this.details = details

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError)
    }
  }
}

// Common HTTP Errors
export class BadRequestError extends AppError {
  constructor(message = 'Richiesta non valida', errorCode = 'BAD_REQUEST', details) {
    super({ message, statusCode: 400, errorCode, details })
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Non autorizzato', errorCode = 'UNAUTHORIZED', details) {
    super({ message, statusCode: 401, errorCode, details })
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Risorsa non trovata', errorCode = 'NOT_FOUND', details) {
    super({ message, statusCode: 404, errorCode, details })
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflitto di risorse', errorCode = 'CONFLICT', details) {
    super({ message, statusCode: 409, errorCode, details })
  }
}

export class InternalServerError extends AppError {
  constructor(message = 'Errore interno del server', errorCode = 'INTERNAL_SERVER_ERROR', details) {
    super({ message, statusCode: 500, errorCode, details })
  }
}
