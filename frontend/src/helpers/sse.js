export const consumeSseJson = async (reader, { onJson, shouldBreak } = {}) => {
  const decoder = new TextDecoder()
  let buffer = ''

  const flushEvents = (chunk) => {
    // Supporta \n\n e \r\n\r\n
    const events = chunk.split(/\r?\n\r?\n/)
    return events
  }

  while (true) {
    if (shouldBreak?.()) {
      try {
        await reader.cancel()
      } catch {
        // ignore
      }
      break
    }

    const { value, done } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const parts = flushEvents(buffer)
    buffer = parts.pop() || ''

    for (const rawEvent of parts) {
      // Event può avere linee: event:, id:, data: (multipli)
      const lines = rawEvent.split(/\r?\n/)
      const dataLines = []
      let type

      for (const line of lines) {
        if (line.startsWith('data:')) {
          dataLines.push(line.slice(5).trimStart())
        } else if (line.startsWith('event:')) {
          type = line.slice(6).trimStart()
        }
        // opzionale: id:, retry:, ecc.
      }

      if (!dataLines.length) continue
      const payloadStr = dataLines.join('\n')

      try {
        const json = JSON.parse(payloadStr)
        // Se il backend usa "type" nel JSON, ok; altrimenti usa "type" da event:
        if (type && !json.type) json.type = type
        onJson?.(json)
      } catch (err) {
        console.error('Invalid JSON from SSE:', rawEvent, err)
      }
    }
  }
}
