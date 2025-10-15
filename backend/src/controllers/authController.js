import { authService } from '#services'

export const authController = {
  register: async (req, res) => {
    const { name, email, password } = req.body

    const user = await authService.register(name, email, password)
    res.status(201).json({ user })
  },

  login: async (req, res) => {
    const { email, password } = req.body

    const { accessToken, refreshToken } = await authService.login(email, password)
    res.json({ accessToken, refreshToken })
  },

  refresh: async (req, res) => {
    const { refreshToken } = req.body

    const { accessToken } = await authService.refresh(refreshToken)
    res.json({ accessToken })
  },

  logout: async (req, res) => {
    const { refreshToken } = req.body

    await authService.logout(refreshToken)
    res.status(200).json({ message: 'Disconnesso' })
  },
}
