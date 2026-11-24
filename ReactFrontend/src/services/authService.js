import api from './api'

/**
 * POST /api/auth/login returns AuthResponse.
 *
 * AuthResponse exposes the JWT through getMessage(), so the JSON property is
 * "message". We also accept "token" in case the DTO is changed later.
 */
export async function login(username, password) {
  const { data } = await api.post('/auth/login', { username, password })
  const token = data?.token || data?.message

  if (!token) {
    throw new Error('The server did not return a sign-in token.')
  }

  return token
}

/** POST /api/auth/register returns { id, username, role }. */
export async function register(username, password) {
  const { data } = await api.post('/auth/register', { username, password })
  return data
}
