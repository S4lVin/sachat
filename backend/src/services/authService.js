import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'
import { userService } from '#services'
import { EmailTaken, AuthFailed, InvalidRefreshToken } from '#errors'

const prisma = new PrismaClient()

// Helpers
const isConflictError = (err) => err?.code === 'P2002'
const isNotFoundError = (err) => err?.errorCode === 'USER_NOT_FOUND'

const safeJWTVerify = (token, secret) => {
  try {
    return jwt.verify(token, secret)
  } catch {
    return null
  }
}

const createAuthTokens = async (user) => {
  const payload = { userId: user.id, email: user.email, role: user.role }

  const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' })
  const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '30d' })

  await userService.updateById(user.id, { refreshToken })
  return { accessToken, refreshToken }
}

export const authService = {
  register: async (email, password, name) => {
    const hashedPassword = await bcrypt.hash(password, 10)

    let user
    try {
      user = await userService.create({
        email,
        password: hashedPassword,
        name,
      })
    } catch (err) {
      if (isConflictError(err)) throw EmailTaken()
      throw err
    }

    const { accessToken, refreshToken } = await createAuthTokens(user)
    return { accessToken, refreshToken }
  },

  login: async (email, password) => {
    let user
    try {
      user = await userService.findByEmail(email, { sensitive: true })
    } catch (err) {
      if (isNotFoundError(err)) throw AuthFailed()
      throw err
    }

    const validPassword = await bcrypt.compare(password, user.password)
    if (!validPassword) throw AuthFailed()

    const { accessToken, refreshToken } = await createAuthTokens(user)
    return { accessToken, refreshToken }
  },

  refresh: async (refreshToken) => {
    const payload = safeJWTVerify(refreshToken, process.env.REFRESH_TOKEN_SECRET)
    if (!payload) throw InvalidRefreshToken()

    let user
    try {
      user = await userService.findById(payload.userId, { sensitive: true })
    } catch (err) {
      if (isNotFoundError(err)) throw InvalidRefreshToken()
    }

    if (user.refreshToken !== refreshToken) throw InvalidRefreshToken()

    const accessToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '15m' },
    )

    return { accessToken }
  },

  logout: async (refreshToken) => {
    let user
    try {
      user = await userService.findByRefreshToken(refreshToken)
    } catch (err) {
      if (isNotFoundError(err)) throw InvalidRefreshToken()
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: null },
    })
  },
}
