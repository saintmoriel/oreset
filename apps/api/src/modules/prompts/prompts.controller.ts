import type { Request, Response } from 'express'
import { z } from 'zod'
import * as promptsService from './prompts.service'

const contentSchema = z.object({ content: z.string().min(1) })

export async function listForBatch(req: Request, res: Response) {
  const prompts = await promptsService.listByBatch(req.params.batchId)
  res.status(200).json({ prompts })
}

export async function create(req: Request, res: Response) {
  const { content } = contentSchema.parse(req.body)
  const prompt = await promptsService.create({ batchId: req.params.batchId, content })
  res.status(201).json({ prompt })
}

export async function update(req: Request, res: Response) {
  const { content } = contentSchema.parse(req.body)
  const prompt = await promptsService.update(req.params.id, content)
  res.status(200).json({ prompt })
}

export async function remove(req: Request, res: Response) {
  await promptsService.remove(req.params.id)
  res.status(204).send()
}
