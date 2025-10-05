import { logger } from '#logger'
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

const getPrismaStatusCode = (errorCode) => {
  const num = parseInt(errorCode.substring(1))
  for (const { codes, status } of Object.values(PRISMA_ERROR_MAP)) {
    if (codes.includes(num)) return status
  }
}

export const errorHandler = (error, req, res, next) => {
  const logContext = {
    route: `${req.method} ${req.originalUrl}`,
    user: req.user ? { id: req.user.id, email: req.user.email } : 'Guest',
    error: {
      name: error.name,
      message: error.message,
      stack: process.env.LOG_STACK === 'true' ? error.stack : undefined,
      ...(error.statusCode && { statusCode: error.statusCode }),
      ...(error.code && { code: error.code }),
    },
  }
  
  logger.error(logContext, 'Request processing failed');


  let statusCode;
  let message;

  // 1. Errore custom
  if (isCustomError(error)) {
    statusCode = error.statusCode || 500;
    message = error.message || getReasonPhrase(statusCode) || 'An error occurred';
  }
  // 2. Errore Prisma
  else if (isPrismaError(error)) {
    statusCode = getPrismaStatusCode(error.code) || 500;
    message = getReasonPhrase(statusCode) || 'Database error';
  }
  // 3. Altri errori
  else {
    statusCode = getValidStatusCode(error) || 500;
    message = getReasonPhrase(statusCode) || 'An error occurred';
  }

  return res.status(statusCode).json({ error: { message } });
}