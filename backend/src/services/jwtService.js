import jsonwebtoken from 'jsonwebtoken'
import { UnauthorizedError } from '../errors.js'

// Helpers
const InvalidRefreshToken = () =>
  new UnauthorizedError('Refresh token non valido', 'INVALID_REFRESH_TOKEN')
const InvalidAccessToken = () =>
  new UnauthorizedError('Access token non valido', 'INVALID_ACCESS_TOKEN')

export const jwtService = {
  signAccessToken: (payload) => {
    return jsonwebtoken.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' })
  },

  signRefreshToken: (payload) => {
    return jsonwebtoken.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '30d' })
  },

  verifyAccessToken: (token) => {
    try {
      return jsonwebtoken.verify(token, process.env.ACCESS_TOKEN_SECRET)
    } catch {
      throw InvalidAccessToken()
    }
  },

  verifyRefreshToken: (token) => {
    try {
      return jsonwebtoken.verify(token, process.env.REFRESH_TOKEN_SECRET)
    } catch {
      throw InvalidRefreshToken()
    }
  },
}
