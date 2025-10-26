import jwt from 'jsonwebtoken'
import { InvalidAccessToken, InvalidRefreshToken } from '#core/errors/authErrors.js'

export const jwtoken = {
  signAccessToken(payload) {
    return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' })
  },

  signRefreshToken(payload) {
    return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '30d' })
  },

  verifyAccessToken(token) {
    try {
      return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    } catch {
      throw InvalidAccessToken()
    }
  },

  verifyRefreshToken(token) {
    try {
      return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET)
    } catch {
      throw InvalidRefreshToken()
    }
  },
}
