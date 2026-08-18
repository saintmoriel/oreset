import type { Request, Response } from 'express'
import * as batchesService from './batches.service'
import { HttpError } from '../../middleware/error-handler'

export async function list(_req: Request, res: Response) {
  const batches = await batchesService.listAvailableBatches()
  res.status(200).json({ batches })
}

export async function getById(req: Request, res: Response) {
  const batch = await batchesService.getBatchById(req.params.id)
  if (!batch) throw new HttpError(404, 'not_found', 'Batch not found.')
  res.status(200).json({ batch })
}
