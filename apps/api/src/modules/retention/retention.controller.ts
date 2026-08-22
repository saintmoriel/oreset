import type { Request, Response } from 'express'
import * as retentionService from './retention.service'

export async function run(_req: Request, res: Response) {
  const result = await retentionService.runSweep()
  res.status(200).json(result)
}
