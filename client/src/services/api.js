const apiBaseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')

export function apiUrl(path) {
  return `${apiBaseUrl}${path}`
}

export async function readApiError(response) {
  const body = await response.json().catch(() => ({}))
  return body.message || `Request failed (${response.status})`
}
