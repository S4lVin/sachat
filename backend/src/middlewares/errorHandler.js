import { Prisma } from '@prisma/client'
import { getReasonPhrase } from 'http-status-codes'
import { CustomError, getValidStatusCode } from '#utils'

const PRISMA_ERROR_MAP = {
  validation: {
    codes: [2000, 2005, 2006, 2007, 2011, 2012, 2013, 2019, 2020],
    status: 400,
  },
  notFound: {
    codes: [2001, 2015, 2018, 2025],
    status: 404,
  },
  conflict: {
    codes: [2002, 2014, 2017],
    status: 409,
  },
  foreignKey: {
    codes: [2003, 2004],
    status: 400,
  },
  timeout: {
    codes: [2024, 2034],
    status: 408,
  },
}

const isCustomError = (error) => {
  return error instanceof CustomError
}

const isPrismaError = (error) => {
  return error.name === 'PrismaClientKnownRequestError' && error.code?.startsWith('P')
}

const getPrismaStatusCode = (errorCode) => {
  const errorNumber = parseInt(errorCode.substring(1))

  for (const category of Object.values(PRISMA_ERROR_MAP)) {
    if (category.codes.includes(errorNumber)) {
      return category.status
    }
  }

  return 500
}

export const errorHandler = (error, req, res, next) => {
  if (process.env.APP_DEBUG === 'true') {
    next(error)
    return
  }

  // Caso 1: CustomError
  if (isCustomError(error)) {
    console.error(error)
    return res.status(error.statusCode).json({
      error: { message: error.message },
    })
  }

  // Caso 2: PrismaError
  if (isPrismaError(error)) {
    const statusCode = getPrismaStatusCode(error.code)
    const message = getReasonPhrase(statusCode) || 'Database error'
    console.error(error)
    return res.status(statusCode).json({
      error: { message },
    })
  }

  // Caso 3: fallback
  const statusCode = getValidStatusCode(error) || 500
  const message = getReasonPhrase(statusCode) || 'An error occurred'

  console.error(error)
  res.status(statusCode).json({
    error: { message },
  })
}
