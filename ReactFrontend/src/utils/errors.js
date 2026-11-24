/** Turn an API failure into a message that is useful in the interface. */
export function getErrorMessage(error, fallback = 'Something went wrong. Try again.') {
  if (!error?.response) {
    if (error?.code === 'ECONNABORTED') {
      return 'The server took too long to respond. Try again.'
    }

    // Errors thrown by our own service code have no request attached.
    if (!error?.request && error?.message) {
      return error.message
    }

    return 'Cannot reach the server. Make sure the backend is running on localhost:8080.'
  }

  const { status, data } = error.response

  // Validation errors from GlobalExceptionHandler are a list of strings.
  if (Array.isArray(data)) {
    return data.filter(Boolean).join(' ')
  }

  if (typeof data === 'string' && data.trim() && !data.includes('<html')) {
    return data
  }

  if (data && typeof data === 'object') {
    if (data.message && data.message !== 'No message available') {
      return data.message
    }

    if (data.error && !['Unauthorized', 'Forbidden', 'Bad Request'].includes(data.error)) {
      return data.error
    }
  }

  if (status === 401) return 'Your session has ended. Sign in again.'
  if (status === 403) return 'You do not have access to that task.'
  if (status === 404) return 'That task could not be found.'
  if (status === 409) return 'That already exists. Try a different value.'
  if (status >= 500) return 'The server ran into a problem. Try again in a moment.'

  return fallback
}
