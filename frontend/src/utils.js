export const consumeSseJson = async (reader, onJson, shouldBreak) => {
  // TODO: Move this somewhere else and delete utils
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    if (shouldBreak && shouldBreak()) {
      try {
        await reader.cancel()
      } catch {
        // Ignoro eventuali errori di cancel
      }
      break
    }

    const { value, done } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n\n')
    buffer = lines.pop() || ''

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      const payload = line.slice(6)
      try {
        const json = JSON.parse(payload)
        onJson(json)
      } catch (err) {
        console.error('Invalid JSON from SSE:', line, err)
      }
    }
  }
}
