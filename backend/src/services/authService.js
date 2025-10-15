import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'
import { EmailTaken, AuthFailed, InvalidRefreshToken } from '#errors'

const prisma = new PrismaClient()

// Helpers
const safeJWTVerify = (token, secret) => {
  try {
    return jwt.verify(token, secret)
  } catch {
    return null
  }
}

const createAuthTokens = async (user) => {
  const accessToken = jwt.sign(
    { userId: user.id, email: user.email },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: '15m' },
  )
  const refreshToken = jwt.sign(
    { userId: user.id, email: user.email },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: '30d' },
  )

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken },
  })
  return { accessToken, refreshToken }
}

export const authService = {
  register: async (name, email, password) => {
    const hashedPassword = await bcrypt.hash(password, 10)
    let user = null

    try {
      user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
        },
      })
    } catch (error) {
      if (error.code === 'P2002') throw EmailTaken()
      throw error
    }

    const { accessToken, refreshToken } = await createAuthTokens(user)
    return { user, accessToken, refreshToken }
  },

  login: async (email, password) => {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    })
    if (!user) throw AuthFailed()

    const validPassword = await bcrypt.compare(password, user.password)
    if (!validPassword) throw AuthFailed()

    const { accessToken, refreshToken } = await createAuthTokens(user)
    return { user, accessToken, refreshToken }
  },

  refresh: async (refreshToken) => {
    const payload = safeJWTVerify(refreshToken, process.env.REFRESH_TOKEN_SECRET)
    if (!payload) throw InvalidRefreshToken()

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    })
    if (!user || user.refreshToken !== refreshToken) throw InvalidRefreshToken()

    const accessToken = jwt.sign(
      { userId: payload.userId, email: payload.email },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '15m' },
    )

    return { accessToken }
  },

  logout: async (refreshToken) => {
    const user = await prisma.user.findUnique({
      where: { refreshToken },
    })
    if (!user) throw InvalidRefreshToken()

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: null },
    })
  },
}
