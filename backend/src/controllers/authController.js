import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { PrismaClient } from "#prisma";

const prisma = new PrismaClient()

export const authController = {
  register: async (req, res) => {
    const { name, email, password } = req.body
    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name
      }
    })
    res.status(201).json(user)
  },

  login: async (req, res) => {
    const { email, password } = req.body

    const user = await prisma.user.findUnique({
      where: {
        email
      }
    })

    const validPassword = await bcrypt.compare(password, user.password)
    if (!validPassword) {
      throw Object.assign(new Error(), { statusCode: 401 })
    }

    const accessToken = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '15m' }
    )
    res.json({ accessToken })
  }
}