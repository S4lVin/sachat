import { ConflictError, UnauthorizedError } from './appErrors.js'

export const EmailTaken = () => new ConflictError('Indirizzo email già in uso', 'EMAIL_TAKEN')
export const AuthFailed = () =>
  new UnauthorizedError('Email o password non valida', 'AUTHENTICATION_FAILED')
export const MissingAccessToken = () =>
  new UnauthorizedError('Access token mancante', 'MISSING_ACCESS_TOKEN')
export const InvalidRefreshToken = () =>
  new UnauthorizedError('Refresh token non valido', 'INVALID_REFRESH_TOKEN')
export const InvalidAccessToken = () =>
  new UnauthorizedError('Access token non valido', 'INVALID_ACCESS_TOKEN')
