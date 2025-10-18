const safeParse = (str) => {
  try {
    return JSON.parse(str)
  } catch {
    return null
  }
}

export const toNdjsonAsyncIterable = (response) => {
  const reader = response.body.getReader()
  const decoder = new TextDecoder()

  const iterable = {
    async *[Symbol.asyncIterator]() {
      let buffer = ''
      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split(/\r?\n/)
          buffer = lines.pop() ?? ''

          for (const line of lines) {
            const trimmed = line.trim()
            if (!trimmed) continue

            yield safeParse(trimmed)
          }
        }
      } catch (err) {
        // Se abortisci via AbortController, qui arriva AbortError: esci silenziosamente
        if (err?.name !== 'AbortError') throw err
      } finally {
        try {
          reader.releaseLock()
        } catch {}
        try {
          response.body?.cancel()
        } catch {}
      }
    },
    cancel(reason) {
      try {
        reader.cancel(reason)
      } catch {}
    },
    response,
  }

  return iterable
}
