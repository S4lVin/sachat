import { router } from '@/router'
import { useAuthStore } from '@/stores/authStore'
import { storeToRefs } from 'pinia'
import { toNdjsonAsyncIterable } from './ndjson'

const backendUrl = import.meta.env.VITE_BACKEND_URL

export class ApiError extends Error {
  constructor({ message, statusCode, errorCode, details }) {
    super(message)
    this.name = 'ApiError'
    this.statusCode = statusCode
    this.errorCode = errorCode
    this.details = details
  }
}

const getHeaders = (accessToken, extraHeaders = {}) => ({
  'Content-Type': 'application/json',
  ...(extraHeaders || {}),
  ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
})

const buildFetchOptions = (accessToken, options = {}) => {
  const { method = 'GET', body, signal, headers } = options
  return {
    method,
    signal,
    headers: getHeaders(accessToken, headers),
    body: body !== undefined ? JSON.stringify(body) : undefined,
  }
}

const safeJSON = async (res) => res.json().catch(() => null)

export const request = async (path, options = {}) => {
  const authStore = useAuthStore()
  const { accessToken } = storeToRefs(authStore)

  // Il replace evita '/' duplicati: api//path -> api/path
  const url = `${backendUrl}/api/${path}`.replace(/([^:]\/)\/+/g, '$1')
  const response = await fetch(url, buildFetchOptions(accessToken.value, options))

  if (!response.ok) {
    const payload = await safeJSON(response)

    // Se l'access token è invalido proviamo ad aggiornarlo con il refresh token
    if (payload?.error?.errorCode === 'INVALID_ACCESS_TOKEN' && !options.hasRetried) {
      const newToken = await authStore.refreshAccessToken()
      if (newToken) return request(path, { ...options, hasRetried: true })
      return router.push({ name: 'Auth' })
    }

    const message = payload?.error?.message || 'Errore sconosciuto'
    const statusCode = response.statusCode || 500
    const errorCode = payload?.error?.errorCode || 'UNKNOWN_ERROR'
    const details = payload?.error?.details

    throw new ApiError({ message, statusCode, errorCode, details })
  }

  if (response.status === 204) return null

  const contentType = response.headers.get('content-type')
  if (contentType.startsWith('application/x-ndjson')) return toNdjsonAsyncIterable(response)
  if (contentType.startsWith('application/json')) return safeJSON(response)

  return response
}

export const api = {
  get: (path, options = {}) => request(path, { ...options, method: 'GET' }),

  post: (path, body, options = {}) => request(path, { ...options, method: 'POST', body }),

  put: (path, body, options = {}) => request(path, { ...options, method: 'PUT', body }),

  patch: (path, body, options = {}) => request(path, { ...options, method: 'PATCH', body }),

  delete: (path, options = {}) => request(path, { ...options, method: 'DELETE' }),
}
