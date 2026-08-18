import type { Request, Response, NextFunction } from 'express'
import type { RoleType, StaffRole } from '@oreset/shared'

// Spec format: "role" or "role:staffRole", e.g. "operator", "staff:admin".
// Composable per-route: requireRole('staff:qa_reviewer', 'staff:admin')
type RoleSpec = RoleType | `staff:${StaffRole}`

export function requireRole(...specs: RoleSpec[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user
    if (!user) {
      res.status(401).json({ error: { code: 'unauthenticated', message: 'Sign-in required.' } })
      return
    }

    const allowed = specs.some((spec) => {
      const [role, staffRole] = spec.split(':') as [RoleType, StaffRole | undefined]
      if (user.role !== role) return false
      if (staffRole && user.staffRole !== staffRole) return false
      return true
    })

    if (!allowed) {
      res.status(403).json({ error: { code: 'forbidden', message: 'You do not have access to this resource.' } })
      return
    }

    next()
  }
}
