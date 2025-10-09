export const streamToJson = async (reader, onEvent) => {
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { value, done } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split("\n\n")
    buffer = lines.pop() || ''

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        try {
          const json = JSON.parse(line.slice(6))
          onEvent(json)
        } catch (err) {
          console.error("Invalid JSON from SSE:", line, err)
        }
      }
    }
  }
}