import type { AccessTokenClaims } from '@oreset/shared'

declare global {
  namespace Express {
    interface Request {
      user?: AccessTokenClaims
    }
  }
}

export {}
