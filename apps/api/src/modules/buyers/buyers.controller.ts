import type { Request, Response } from 'express'
import { z } from 'zod'
import * as buyersService from './buyers.service'

const provisionSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  displayName: z.string().min(1),
})

export async function provision(req: Request, res: Response) {
  const body = provisionSchema.parse(req.body)
  const { user } = await buyersService.provisionBuyer({ ...body, provisionedBy: req.user!.sub })
  res.status(201).json({ user })
}

export async function list(_req: Request, res: Response) {
  const buyers = await buyersService.listBuyers()
  res.status(200).json({ buyers })
}

export async function myDatasets(req: Request, res: Response) {
  const items = await buyersService.getMyDatasets(req.user!.sub)
  res.status(200).json({ datasets: items })
}

export async function myDatasetDetail(req: Request, res: Response) {
  const dataset = await buyersService.getMyDatasetDetail(req.user!.sub, req.params.id)
  res.status(200).json({ dataset })
}

export async function myStats(req: Request, res: Response) {
  const stats = await buyersService.getMyStats(req.user!.sub)
  res.status(200).json(stats)
}

export async function myDownloads(req: Request, res: Response) {
  const downloads = await buyersService.getMyDownloadActivity(req.user!.sub)
  res.status(200).json({ downloads })
}

export async function downloadItem(req: Request, res: Response) {
  const { url } = await buyersService.recordDownload(req.user!.sub, req.params.id, req.params.itemId)
  res.redirect(302, url)
}
