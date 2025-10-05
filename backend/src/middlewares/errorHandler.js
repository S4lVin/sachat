import { getReasonPhrase } from 'http-status-codes'
import { CustomError, getValidStatusCode } from '#utils'

const PRISMA_ERROR_MAP = {
  validation: { codes: [2000, 2005, 2006, 2007, 2011, 2012, 2013, 2019, 2020], status: 400 },
  notFound: { codes: [2001, 2015, 2018, 2025], status: 404 },
  conflict: { codes: [2002, 2014, 2017], status: 409 },
  foreignKey: { codes: [2003, 2004], status: 400 },
  timeout: { codes: [2024, 2034], status: 408 },
}

const isCustomError = (error) => error instanceof CustomError

const isPrismaError = (error) => error?.name === 'PrismaClientKnownRequestError'

// Converte codice Prisma in HTTP status code
const getPrismaStatusCode = (errorCode) => {
  const num = parseInt(errorCode.substring(1))
  for (const { codes, status } of Object.values(PRISMA_ERROR_MAP)) {
    if (codes.includes(num)) return status
  }
  return 500
}

// Restituisce un messaggio HTTP sicuro basato sullo status code
const safeReasonPhrase = (statusCode) => {
  try {
    return getReasonPhrase(statusCode)
  } catch {
    return undefined
  }
}

export const errorHandler = (error, req, res, next) => {
  if (process.env.APP_DEBUG === 'true') {
    return next(error)
  }

  console.error(error)

  // 1 Errore custom
  if (isCustomError(error)) {
    const message = error.message || safeReasonPhrase(error.statusCode) || 'An error occurred'
    return res.status(error.statusCode || 500).json({ error: { message } })
  }

  // 2 Errore prisma
  if (isPrismaError(error)) {
    const statusCode = getPrismaStatusCode(error.code)
    const message = safeReasonPhrase(statusCode) || 'Database error'
    return res.status(statusCode).json({ error: { message } })
  }

  // 3️ Altri errori
  const statusCode = getValidStatusCode(error) || 500
  const message = safeReasonPhrase(statusCode) || 'An error occurred'
  return res.status(statusCode).json({ error: { message } })
}
