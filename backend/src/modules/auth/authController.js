import { authUseCase } from './authUseCase.js'

export const authController = {
  register: async (req, res) => {
    const { email, password, name } = req.body

    const tokens = await authUseCase.register({ email, password, name })
    res.status(201).json({ ...tokens })
  },

  login: async (req, res) => {
    const { email, password } = req.body

    const tokens = await authUseCase.login({ email, password })
    res.json({ ...tokens })
  },

  refresh: async (req, res) => {
    const { refreshToken } = req.body

    const tokens = await authUseCase.refresh({ refreshToken })
    res.json({ ...tokens })
  },

  logout: async (req, res) => {
    await authUseCase.logout({ userId: req.user.id })
    res.status(204).end()
  },
}
