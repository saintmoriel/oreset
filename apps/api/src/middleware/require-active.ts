import type { Request, Response, NextFunction } from 'express'

// Certification gate, distinct from RBAC — checks account lifecycle
// status, not role. Used on the operator review-queue routes so a still-
// 'pending' operator's (correctly role-scoped) cookie is rejected
// server-side too, not just by proxy.ts's Edge gate.
export function requireActive(req: Request, res: Response, next: NextFunction) {
  if (req.user?.status !== 'active') {
    res.status(403).json({
      error: { code: 'not_approved', message: 'Your application is still under review. You will get an email when it is approved.' },
    })
    return
  }
  next()
}
