import type { Request, Response } from 'express'
import * as adminService from './admin.service'

export async function overview(req: Request, res: Response) {
  const result = await adminService.getOverview(req.user!.staffRole!)
  res.status(200).json(result)
}
