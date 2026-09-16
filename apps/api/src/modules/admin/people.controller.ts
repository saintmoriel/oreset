import type { Request, Response } from 'express'
import { z } from 'zod'
import { STAFF_ROLES } from '@oreset/shared'
import * as people from './people.service'

const createStaffSchema = z.object({
  email: z.string().email(),
  displayName: z.string().min(1).max(120),
  staffRole: z.enum(STAFF_ROLES),
})

const updateUserSchema = z
  .object({
    status: z.enum(['active', 'suspended']).optional(),
    staffRole: z.enum(STAFF_ROLES).optional(),
    displayName: z.string().min(1).max(120).optional(),
  })
  .refine((v) => v.status !== undefined || v.staffRole !== undefined || v.displayName !== undefined, {
    message: 'Nothing to update',
  })

function actor(req: Request) {
  return { id: req.user!.sub, role: `staff:${req.user!.staffRole ?? 'admin'}` }
}

export async function list(_req: Request, res: Response) {
  const [users, roles] = [await people.listPeople(), people.ROLE_ACCESS]
  res.status(200).json({ users, roles })
}

export async function createStaff(req: Request, res: Response) {
  const body = createStaffSchema.parse(req.body)
  const result = await people.createStaff(actor(req), body)
  res.status(201).json(result)
}

export async function updateUser(req: Request, res: Response) {
  const body = updateUserSchema.parse(req.body)
  const user = await people.updateUser(actor(req), req.params.id, body)
  res.status(200).json({ user })
}

export async function resetPassword(req: Request, res: Response) {
  const result = await people.resetPassword(actor(req), req.params.id)
  res.status(200).json(result)
}

export async function clients(_req: Request, res: Response) {
  const list = await people.listClients()
  res.status(200).json({ clients: list })
}
