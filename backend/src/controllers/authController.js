import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'
import { CustomError } from '#utils'

const prisma = new PrismaClient()

export const authController = {
  register: async (req, res) => {
    const { name, email, password } = req.body
    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    })
    res.status(201).json({ user })
  },

  login: async (req, res) => {
    const { email, password } = req.body

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    })
    if (!user) {
      throw new CustomError(401, 'Invalid credentials')
    }

    const validPassword = await bcrypt.compare(password, user.password)
    if (!validPassword) {
      throw new CustomError(401, 'Invalid credentials')
    }

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
    if (!refreshToken) {
      throw new CustomError(401, 'Refresh token is required')
    }

    try {
      const payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)

      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
      })

      if (!user || user.refreshToken !== refreshToken) {
        throw new CustomError(403, 'Invalid refresh token')
      }

      const accessToken = jwt.sign(
        { userId: payload.userId, email: payload.email },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '15m' },
      )

      res.json({ accessToken })
    } catch {
      if (error instanceof CustomError) throw error
      throw new CustomError(403, 'Invalid or expired refresh token')
    }
  },

  logout: async (req, res) => {
    const { refreshToken } = req.body
    if (!refreshToken) {
      throw new CustomError(401, 'Refresh token is required')
    }

    const user = await prisma.user.findUnique({
      where: { refreshToken },
    })

    if (!user) {
      throw new CustomError(403, 'Invalid refresh token')
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: null },
    })

    res.status(200).json({message: "Logged out"})
  }
}
