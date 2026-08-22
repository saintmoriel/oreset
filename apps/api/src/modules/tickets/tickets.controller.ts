import type { Request, Response } from 'express'
import { z } from 'zod'
import * as ticketsService from './tickets.service'

const resolveSchema = z.object({
  resolutionNotes: z.string().optional(),
})

export async function list(_req: Request, res: Response) {
  const tickets = await ticketsService.listTickets()
  res.status(200).json({ tickets })
}

export async function resolve(req: Request, res: Response) {
  const { resolutionNotes } = resolveSchema.parse(req.body)
  const ticket = await ticketsService.resolveTicket(req.params.id, req.user!.sub, resolutionNotes)
  res.status(200).json({ ticket })
}
