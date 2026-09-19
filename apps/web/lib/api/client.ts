export type ValidationDetails = {
  fieldErrors?: Record<string, string[] | undefined>
  formErrors?: string[]
}

export class ApiError extends Error {
  status: number
  code: string
  details?: ValidationDetails
  constructor(status: number, code: string, message: string, details?: ValidationDetails) {
    super(message)
    this.status = status
    this.code = code
    this.details = details
  }
}

/** Turn zod's terse defaults into sentences a person can act on. */
function humanize(raw: string): string {
  if (raw === 'Required') return 'This answer is missing.'
  const min = raw.match(/at least (\d+) character/)
  if (min) return `Needs at least ${min[1]} characters.`
  const max = raw.match(/at most (\d+) character/)
  if (max) return `Keep this under ${max[1]} characters.`
  if (/Invalid email/i.test(raw)) return 'Enter a valid email address.'
  if (/Invalid url/i.test(raw)) return 'Include https:// at the start of the link.'
  if (/Invalid enum value/i.test(raw)) return 'Pick one of the listed options.'
  if (/must contain at least 1 element/i.test(raw)) return 'Add at least one entry.'
  return raw
}

/**
 * Field name -> readable message for a failed request, or an empty object when
 * the server sent no field detail. Form code can drop these straight onto inputs.
 */
export function fieldMessages(err: unknown): Record<string, string> {
  if (!(err instanceof ApiError) || !err.details?.fieldErrors) return {}
  const out: Record<string, string> = {}
  for (const [field, msgs] of Object.entries(err.details.fieldErrors)) {
    if (msgs && msgs.length) out[field] = humanize(msgs[0])
  }
  return out
}

/** One sentence to show when a request fails, naming the fields if the server did. */
export function describeError(err: unknown, fallback: string): string {
  if (!(err instanceof ApiError)) return fallback
  const fields = Object.keys(fieldMessages(err))
  if (fields.length) return `Check: ${fields.join(', ')}.`
  const formErr = err.details?.formErrors?.[0]
  return formErr ? humanize(formErr) : err.message || fallback
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
    throw new ApiError(
      res.status,
      body?.error?.code ?? 'unknown_error',
      body?.error?.message ?? res.statusText,
      body?.error?.details ?? undefined,
    )
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
