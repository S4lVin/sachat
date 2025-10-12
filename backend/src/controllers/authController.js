import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'
import { ConflictError, UnauthorizedError } from '#utils'

const prisma = new PrismaClient()

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
      if (error.code === 'P2002')
        throw new ConflictError('Indirizzo email già in uso', 'EMAIL_TAKEN')
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
    if (!user) throw new UnauthorizedError('Email o password non valida', 'AUTHENTICATION_FAILED')

    const validPassword = await bcrypt.compare(password, user.password)
    if (!validPassword)
      throw new UnauthorizedError('Email o password non valida', 'AUTHENTICATION_FAILED')

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

    try {
      const payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)
    } catch {
      throw new UnauthorizedError('Refresh token non valido', 'INVALID_REFRESH_TOKEN')
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    })
    if (!user || user.refreshToken !== refreshToken)
      throw new UnauthorizedError('Refresh token non valido', 'INVALID_REFRESH_TOKEN')

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
    if (!user) throw new UnauthorizedError('Refresh token non valido', 'INVALID_REFRESH_TOKEN')

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: null },
    })

    res.status(200).json({ message: 'Disconnesso' })
  },
}
