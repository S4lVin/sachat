export class CustomError extends Error {
  constructor(statusCode, message) {
    super(message)
    this.statusCode = statusCode
  }
}

export const isValidStatusCode = (code) => {
  return typeof code === 'number' && code >= 100 && code < 600
}

export const getValidStatusCode = (error) => {
  const candidates = [error.statusCode, error.status, error.code]

  for (const code of candidates) {
    if (isValidStatusCode(code)) {
      return code
    }
  }
}

