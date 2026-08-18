import { NextResponse, type NextRequest } from 'next/server'
import { ACCESS_COOKIE_NAME, verifyAccessToken, type AccessTokenClaims } from '@oreset/shared'

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET!

type RouteGate = {
  matcher: string
  signInPath: string
  isAllowed: (claims: AccessTokenClaims) => boolean
}

const GATES: RouteGate[] = [
  {
    matcher: '/qa',
    signInPath: '/qa',
    isAllowed: (c) => c.role === 'staff' && (c.staffRole === 'qa_reviewer' || c.staffRole === 'admin'),
  },
  {
    matcher: '/operator',
    signInPath: '/operator',
    isAllowed: (c) => c.role === 'operator',
  },
  {
    matcher: '/admin',
    signInPath: '/admin',
    isAllowed: (c) =>
      c.role === 'staff' &&
      (c.staffRole === 'admin' || c.staffRole === 'compliance' || c.staffRole === 'reviewer_lead'),
  },
]

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl
  const gate = GATES.find((g) => pathname === g.matcher || pathname.startsWith(`${g.matcher}/`))

  // Not a gated route (e.g. /capture, marketing pages) or exactly the
  // flow's own sign-in page — let it through.
  if (!gate || pathname === gate.signInPath) {
    return NextResponse.next()
  }

  const token = req.cookies.get(ACCESS_COOKIE_NAME)?.value
  const redirectToSignIn = () => {
    const url = req.nextUrl.clone()
    url.pathname = gate.signInPath
    url.search = `?next=${encodeURIComponent(pathname)}`
    return NextResponse.redirect(url)
  }

  if (!token) return redirectToSignIn()

  try {
    const claims = await verifyAccessToken(token, ACCESS_TOKEN_SECRET)
    // Deliberately no silent refresh here — an Edge-runtime fetch-and-
    // Set-Cookie on every navigation adds latency. An expired token just
    // bounces to sign-in; the client-side API layer's proactive refresh
    // (lib/api/client.ts) should catch the common case before a nav ever
    // hits an expired token. Documented Phase 0 simplification.
    if (!gate.isAllowed(claims)) return redirectToSignIn()
    return NextResponse.next()
  } catch {
    return redirectToSignIn()
  }
}

export const config = {
  matcher: ['/qa/:path*', '/operator/:path*', '/admin/:path*'],
}
