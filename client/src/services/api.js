export function apiUrl(path) {
  return path
}

export async function readApiError(response) {
  const body = await response.json().catch(() => ({}))
  return body.message || `Request failed (${response.status})`
}
