import type { Request, Response } from 'express'
import { z } from 'zod'
import * as buyersService from './buyers.service'

const provisionSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  displayName: z.string().min(1),
})

const submitCaseSchema = z.object({
  clientName: z.string().min(1).max(200),
  externalRef: z.string().min(1).max(200),
  content: z.string().min(1),
  traceData: z.record(z.unknown()).optional(),
  requiresDualSolve: z.boolean().optional(),
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

// ---------------------------------------------------------------------------
// Verification Cases
// ---------------------------------------------------------------------------

export async function submitCase(req: Request, res: Response) {
  const body = submitCaseSchema.parse(req.body)
  const item = await buyersService.submitCase(req.user!.sub, body)
  res.status(201).json({ item })
}

export async function myCases(req: Request, res: Response) {
  const status = req.query.status as string | undefined
  const cases = await buyersService.getMyCases(req.user!.sub, status)
  res.status(200).json({ cases })
}

export async function myCaseDetail(req: Request, res: Response) {
  const result = await buyersService.getMyCaseDetail(req.user!.sub, req.params.id)
  res.status(200).json(result)
}

export async function myCaseStats(req: Request, res: Response) {
  const stats = await buyersService.getMyCaseStats(req.user!.sub)
  res.status(200).json(stats)
}

export async function myRegressions(req: Request, res: Response) {
  const testCases = await buyersService.getMyRegressions(req.user!.sub)
  const format = (req.query.format as string) ?? 'json'

  if (format === 'jsonl') {
    res.setHeader('Content-Type', 'application/x-ndjson')
    res.setHeader('Content-Disposition', 'attachment; filename="oreset-regression-suite.jsonl"')
    res.status(200).send(testCases.map((tc) => JSON.stringify(tc)).join('\n'))
    return
  }

  res.status(200).json({
    testSuite: {
      generatedAt: new Date().toISOString(),
      platform: 'oreset',
      version: '1.0',
      totalCases: testCases.length,
    },
    testCases,
  })
}
