import type { Request, Response } from 'express'
import { z } from 'zod'
import * as datasetsService from './datasets.service'

const createSchema = z.object({
  title: z.string().min(1),
  campaignId: z.string().uuid(),
  licenseTerms: z.string().min(1),
})

const addItemsSchema = z.object({
  submissionIds: z.array(z.string().uuid()).min(1),
})

const handoffSchema = z.object({
  buyerId: z.string().uuid(),
})

export async function list(_req: Request, res: Response) {
  const items = await datasetsService.listDatasets()
  res.status(200).json({ datasets: items })
}

export async function get(req: Request, res: Response) {
  const dataset = await datasetsService.getDataset(req.params.id)
  res.status(200).json({ dataset })
}

// The pool an admin picks from while assembling a draft — qa_approved
// submissions in this dataset's own campaign, not yet in any dataset.
export async function unassembled(req: Request, res: Response) {
  const dataset = await datasetsService.getDataset(req.params.id)
  const items = await datasetsService.listUnassembledSubmissions(dataset.campaignId)
  res.status(200).json({ submissions: items })
}

export async function create(req: Request, res: Response) {
  const body = createSchema.parse(req.body)
  const dataset = await datasetsService.createDataset({ ...body, createdBy: req.user!.sub })
  res.status(201).json({ dataset })
}

export async function addItems(req: Request, res: Response) {
  const { submissionIds } = addItemsSchema.parse(req.body)
  const result = await datasetsService.addItems(req.params.id, submissionIds)
  res.status(200).json(result)
}

export async function removeItem(req: Request, res: Response) {
  await datasetsService.removeItem(req.params.id, req.params.submissionId)
  res.status(200).json({ ok: true })
}

export async function seal(req: Request, res: Response) {
  const dataset = await datasetsService.sealDataset(req.params.id, req.user!.sub)
  res.status(200).json({ dataset })
}

export async function handoff(req: Request, res: Response) {
  const { buyerId } = handoffSchema.parse(req.body)
  const dataset = await datasetsService.handoffDataset(req.params.id, buyerId, req.user!.sub)
  res.status(200).json({ dataset })
}
