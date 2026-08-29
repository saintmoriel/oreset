import type { Request, Response } from 'express'
import * as adminService from './admin.service'
import * as ingestionService from '../ingestion/ingestion.service'

export async function overview(req: Request, res: Response) {
  const result = await adminService.getOverview(req.user!.staffRole!)
  res.status(200).json(result)
}

export async function regressionSuite(req: Request, res: Response) {
  const clientName = req.query.client as string | undefined
  const since = req.query.since ? new Date(req.query.since as string) : undefined
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined
  const format = (req.query.format as string) ?? 'json'

  const testCases = await ingestionService.getRegressionSuite({ clientName, since, limit })

  if (format === 'jsonl') {
    res.setHeader('Content-Type', 'application/x-ndjson')
    res.setHeader('Content-Disposition', 'attachment; filename="oreset-regression-suite.jsonl"')
    res.status(200).send(testCases.map((tc) => JSON.stringify(tc)).join('\n'))
    return
  }

  res.status(200).json({
    test_suite: {
      generated_at: new Date().toISOString(),
      platform: 'oreset',
      version: '1.0',
      total_cases: testCases.length,
    },
    test_cases: testCases,
  })
}

export async function regressionStats(_req: Request, res: Response) {
  const stats = await ingestionService.getRegressionStats()
  res.status(200).json(stats)
}
