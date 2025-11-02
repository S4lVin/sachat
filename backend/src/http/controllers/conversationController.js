import { conversationActions } from '../../actions/index.js'

// Helpers
const initializeStream = (res) => {
  res.setHeader('Content-Type', 'application/x-ndjson')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders()
}

const writeStream = async (res, eventStream) => {
  for await (const event of eventStream) res.write(JSON.stringify(event) + '\n')
  res.end()
}

export const conversationController = {
  getStream: async (req, res, next) => {
    const { messageId } = req.body

    initializeStream(res)

    const stream = conversationActions.getStream({
      messageId,
      userId: req.user.id,
    })

    await writeStream(res, stream)
  },

  send: async (req, res) => {
    const { parentId, chatId, content } = req.body

    const data = await conversationActions.send({
      parentId,
      chatId,
      userId: req.user.id,
      content,
    })
    res.json(data)
  },

  regenerate: async (req, res) => {
    const { messageId } = req.body

    const assistantMessage = await conversationActions.regenerate({
      messageId,
      userId: req.userId,
    })
    res.json({ assistantMessage })
  },

  cancel: async (req, res) => {
    const { messageId } = req.body

    await conversationActions.cancel({ messageId, userId: req.user.id })
    res.status(204).end()
  },
}
