import { userService } from '#services'

export const userController = {
  get: async (req, res) => {
    const user = await userService.findById(req.user.id)
    res.json({ user })
  },

  update: async (req, res) => {
    const { name, settings } = req.body

    const user = await userService.updateById(req.user.id, {
      name,
      settings
    })
    res.json({ user })
  }
}
