import type { Request, Response } from 'express'
import { z } from 'zod'
import * as ingestionService from './ingestion.service'

const traceInputSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('audio'),
    audioUrl: z.string().url(),
    transcript: z.string(),
    aiInterpretation: z.string(),
  }),
  z.object({
    type: z.literal('text'),
    originalText: z.string(),
    aiInterpretation: z.string(),
  }),
  z.object({
    type: z.literal('document'),
    imageUrl: z.string().url(),
    aiExtraction: z.string(),
  }),
  z.object({
    type: z.literal('conversation'),
    turns: z.array(z.object({
      id: z.string(),
      role: z.enum(['customer', 'ai', 'agent']),
      content: z.string(),
      language: z.string().optional(),
      isDecisionPoint: z.boolean().optional(),
    })),
    aiDecisionSummary: z.string(),
  }),
])

const traceUnitSchema = z.object({
  clientName: z.string().min(1).max(200),
  externalRef: z.string().min(1).max(200),
  content: z.string().min(1),
  traceData: z.object({
    domain: z.enum(['claims', 'lending', 'government', 'healthcare']).optional(),
    scope: z.enum(['language', 'full']).optional().default('full'),
    language: z.string().optional().default('en'),
    input: traceInputSchema,
    aiDecision: z.string(),
    aiOutcome: z.string(),
    decisionCriteria: z.string().nullable().optional(),
    executionLogs: z.array(z.record(z.unknown())).optional(),
    isDualSolve: z.boolean().optional().default(false),
    isGoldStandard: z.boolean().optional().default(false),
  }).optional(),
})

const batchSchema = z.object({
  items: z.array(traceUnitSchema).min(1).max(100),
})

export async function ingest(req: Request, res: Response) {
  const body = traceUnitSchema.parse(req.body)
  const item = await ingestionService.ingestSingle(body)
  res.status(201).json({ item })
}

export async function ingestBatch(req: Request, res: Response) {
  const { items: inputs } = batchSchema.parse(req.body)
  const items = await ingestionService.ingestBatch(inputs)
  res.status(201).json({ items, count: items.length })
}

export async function getStatus(req: Request, res: Response) {
  const item = await ingestionService.getItemStatus(req.params.id)
  res.status(200).json({ item })
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
