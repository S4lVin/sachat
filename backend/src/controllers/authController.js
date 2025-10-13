import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'
import { EmailTaken, AuthFailed, InvalidRefreshToken } from '#errors'

const prisma = new PrismaClient()

const safeJWTVerify = (token, secret) => {
  try {
    return jwt.verify(token, secret)
  } catch {
    return null
  }
}

export const authController = {
  register: async (req, res) => {
    const { name, email, password } = req.body
    const hashedPassword = await bcrypt.hash(password, 10)

    try {
      const user = await prisma.user.create({
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

    res.status(201).json({ user })
  },

  login: async (req, res) => {
    const { email, password } = req.body

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    })
    if (!user) throw AuthFailed()

    const validPassword = await bcrypt.compare(password, user.password)
    if (!validPassword) throw AuthFailed()

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

    res.json({ accessToken, refreshToken })
  },

  refresh: async (req, res) => {
    const { refreshToken } = req.body

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

    res.json({ accessToken })
  },

  logout: async (req, res) => {
    const { refreshToken } = req.body

    const user = await prisma.user.findUnique({
      where: { refreshToken },
    })
    if (!user) throw InvalidRefreshToken()

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: null },
    })

    res.status(200).json({ message: 'Disconnesso' })
  },
}
