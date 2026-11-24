import { getStoredToken } from '../services/api'

/**
 * Read the JWT payload. This is only used for display and expiry handling;
 * the backend still verifies the signature on every request.
 */
export function decodeToken(token) {
  try {
    const payload = token.split('.')[1]
    if (!payload) return null

    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((char) => `%${`00${char.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join(''),
    )

    return JSON.parse(json)
  } catch {
    return null
  }
}

/** Returns { token, username, expiresAt } or null for a missing/expired token. */
export function readSession() {
  const token = getStoredToken()
  if (!token) return null

  const claims = decodeToken(token)
  if (!claims?.sub) return null

  const expiresAt = claims.exp ? claims.exp * 1000 : null
  if (expiresAt && expiresAt <= Date.now()) return null

  return { token, username: claims.sub, expiresAt }
}
