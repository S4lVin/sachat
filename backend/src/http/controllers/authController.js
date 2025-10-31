import { authActions } from '../../actions/index.js'

export const authController = {
  register: async (req, res) => {
    const { email, password, name } = req.body

    const tokens = await authActions.register({ email, password, name })
    res.status(201).json({ ...tokens })
  },

  login: async (req, res) => {
    const { email, password } = req.body

    const tokens = await authActions.login({ email, password })
    res.json({ ...tokens })
  },

  refresh: async (req, res) => {
    const { refreshToken } = req.body

    const tokens = await authActions.refresh({ refreshToken })
    res.json({ ...tokens })
  },

  logout: async (req, res) => {
    await authActions.logout({ userId: req.userId })
    res.status(204).end()
  },
}
