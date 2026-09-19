import type { Request, Response, NextFunction } from 'express'
import { and, eq, inArray, isNull, or, gt, sql } from 'drizzle-orm'
import { ROLE_DEFAULT_MODULES, type AdminModule, type StaffRole } from '@oreset/shared'
import { db } from '../db/client'
import { moduleGrants } from '../db/schema'

// Effective modules = the role's defaults plus every active grant.
// A grant is active when not revoked and not expired.
export async function effectiveModules(userId: string, staffRole: StaffRole | null): Promise<AdminModule[]> {
  const defaults = staffRole ? ROLE_DEFAULT_MODULES[staffRole] ?? [] : []
  const grants = await db
    .select({ module: moduleGrants.module })
    .from(moduleGrants)
    .where(
      and(
        eq(moduleGrants.userId, userId),
        isNull(moduleGrants.revokedAt),
        or(isNull(moduleGrants.expiresAt), gt(moduleGrants.expiresAt, sql`now()`)),
      ),
    )
  const set = new Set<AdminModule>(defaults)
  for (const g of grants) set.add(g.module as AdminModule)
  return [...set]
}

// Same, for many users at once (People page).
export async function activeGrantsByUser(userIds: string[]) {
  if (userIds.length === 0) return new Map<string, { id: string; module: AdminModule; expiresAt: Date | null; reason: string }[]>()
  const rows = await db
    .select({ id: moduleGrants.id, userId: moduleGrants.userId, module: moduleGrants.module, expiresAt: moduleGrants.expiresAt, reason: moduleGrants.reason })
    .from(moduleGrants)
    .where(
      and(
        inArray(moduleGrants.userId, userIds),
        isNull(moduleGrants.revokedAt),
        or(isNull(moduleGrants.expiresAt), gt(moduleGrants.expiresAt, sql`now()`)),
      ),
    )
  const map = new Map<string, { id: string; module: AdminModule; expiresAt: Date | null; reason: string }[]>()
  for (const r of rows) {
    const list = map.get(r.userId) ?? []
    list.push({ id: r.id, module: r.module as AdminModule, expiresAt: r.expiresAt, reason: r.reason })
    map.set(r.userId, list)
  }
  return map
}

// Route guard: staff only, and the person must hold at least one of the
// named modules by role or by grant. The 403 names the module so the web
// side can offer "request access" instead of a dead end.
export function requireModule(...modules: AdminModule[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user
    if (!user) {
      res.status(401).json({ error: { code: 'unauthenticated', message: 'Sign-in required.' } })
      return
    }
    if (user.role !== 'staff') {
      res.status(403).json({ error: { code: 'forbidden', message: 'Staff only.' } })
      return
    }
    try {
      const held = await effectiveModules(user.sub, user.staffRole ?? null)
      const ok = modules.some((m) => held.includes(m))
      if (!ok) {
        res.status(403).json({
          error: {
            code: 'module_required',
            message: 'You do not have this module. You can request access from the Access page.',
            details: { modules },
          },
        })
        return
      }
      next()
    } catch (err) {
      next(err)
    }
  }
}

// Any signed-in staff member (home, own access view).
export function requireStaff(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    res.status(401).json({ error: { code: 'unauthenticated', message: 'Sign-in required.' } })
    return
  }
  if (req.user.role !== 'staff') {
    res.status(403).json({ error: { code: 'forbidden', message: 'Staff only.' } })
    return
  }
  next()
}
