import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { ApiError } from './client'

const API_URL = process.env.NEXT_PUBLIC_API_URL

type FetchOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  body?: unknown
}

// Server Component / Route Handler variant. Server-side fetch() does NOT
// auto-forward the browser's cookies to a different origin the way a
// browser request does — so this reads the incoming request's cookies via
// next/headers and forwards them explicitly. This is the one subtlety
// easy to get wrong when apps/web and apps/api are on different origins.
export async function serverApiFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const cookieStore = await cookies()
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join('; ')

  const res = await fetch(`${API_URL}${path}`, {
    method: options.method ?? 'GET',
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      Cookie: cookieHeader,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
    cache: 'no-store',
  })

  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new ApiError(res.status, body?.error?.code ?? 'unknown_error', body?.error?.message ?? res.statusText)
  }

  if (res.status === 204) return undefined as T
  return res.json()
}

// A cookie can be structurally valid (right signature, not expired) while
// referencing a user row that's gone — e.g. the DB was reseeded, or the
// account was deleted in another tab. proxy.ts's Edge gate can't catch
// this (it only verifies the JWT, never hits the DB), so an authenticated
// Server Component page is the first place it actually surfaces. Call
// this from a page's catch block instead of letting the ApiError bubble
// into Next's generic error overlay — bounces to sign-in like a normal
// expired session would.
export function redirectIfSignedOut(err: unknown, signInPath: string): never {
  if (err instanceof ApiError && err.status === 401) {
    redirect(signInPath)
  }
  throw err
}
