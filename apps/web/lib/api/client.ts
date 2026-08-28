export class ApiError extends Error {
  status: number
  code: string
  constructor(status: number, code: string, message: string) {
    super(message)
    this.status = status
    this.code = code
  }
}

const API_URL = process.env.NEXT_PUBLIC_API_URL

type FetchOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  body?: unknown
}

let refreshing: Promise<boolean> | null = null

async function refreshSession(): Promise<boolean> {
  if (!refreshing) {
    refreshing = fetch(`${API_URL}/api/v1/auth/refresh`, { method: 'POST', credentials: 'include' })
      .then((res) => res.ok)
      .finally(() => {
        refreshing = null
      })
  }
  return refreshing
}

async function rawFetch<T>(path: string, options: FetchOptions): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: options.method ?? 'GET',
    credentials: 'include',
    headers: options.body ? { 'Content-Type': 'application/json' } : undefined,
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new ApiError(res.status, body?.error?.code ?? 'unknown_error', body?.error?.message ?? res.statusText)
  }

  if (res.status === 204) return undefined as T
  return res.json()
}

// Client-side fetch helper: browser calls only. Owns the 401 -> refresh ->
// retry-once dance so components importing from lib/api/endpoints/* never
// have to think about token expiry.
export async function apiFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  try {
    return await rawFetch<T>(path, options)
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      const refreshed = await refreshSession()
      if (refreshed) return rawFetch<T>(path, options)
    }
    throw err
  }
}
