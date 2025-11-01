import { conversationActions } from '../../actions/index.js'

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
  send: async (req, res) => {
    const { parentId, chatId, content } = req.body

    initializeStream(res)
    const eventStream = conversationActions.send({
      parentId,
      chatId,
      userId: req.userId,
      content,
    })

    await writeStream(res, eventStream)
  },

  regenerate: async (req, res) => {
    const { parentId } = req.body

    initializeStream(res)
    const eventStream = conversationActions.regenerate({
      parentId,
      userId: req.userId,
    })

    await writeStream(res, eventStream)
  },
}
