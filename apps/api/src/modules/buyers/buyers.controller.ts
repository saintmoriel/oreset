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

const batchSubmitSchema = z.object({
  cases: z.array(submitCaseSchema).min(1).max(200),
})

const createWebhookSchema = z.object({
  url: z.string().url(),
  events: z.array(z.string().min(1)).min(1),
  description: z.string().max(500).optional(),
})

const updateWebhookSchema = z.object({
  url: z.string().url().optional(),
  events: z.array(z.string().min(1)).min(1).optional(),
  description: z.string().max(500).optional(),
  active: z.boolean().optional(),
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

// ---------------------------------------------------------------------------
// Batch Operations
// ---------------------------------------------------------------------------

export async function submitCasesBatch(req: Request, res: Response) {
  const body = batchSubmitSchema.parse(req.body)
  const items = await buyersService.submitCasesBatch(req.user!.sub, body.cases)
  res.status(201).json({ items, count: items.length })
}

export async function exportCases(req: Request, res: Response) {
  const status = req.query.status as string | undefined
  const format = (req.query.format as string) ?? 'json'
  const results = await buyersService.exportMyCases(req.user!.sub, status)

  if (format === 'jsonl') {
    res.setHeader('Content-Type', 'application/x-ndjson')
    res.setHeader('Content-Disposition', 'attachment; filename="oreset-cases-export.jsonl"')
    res.status(200).send(results.map((r) => JSON.stringify(r)).join('\n'))
    return
  }

  if (format === 'csv') {
    const headers = [
      'id', 'externalRef', 'clientName', 'status', 'language', 'domain',
      'aiDecision', 'aiOutcome', 'requiresDualSolve', 'submittedAt',
      'reviewDecision', 'reviewErrTag', 'reviewSeverity', 'reviewNotes', 'reviewedAt',
    ]
    const rows = results.flatMap((r) => {
      if (r.reviews.length === 0) {
        return [[r.id, r.externalRef, r.clientName, r.status, r.language, r.domain,
          r.aiDecision, r.aiOutcome, r.requiresDualSolve, r.submittedAt,
          '', '', '', '', ''].map(csvEscape).join(',')]
      }
      return r.reviews.map((rev) =>
        [r.id, r.externalRef, r.clientName, r.status, r.language, r.domain,
          r.aiDecision, r.aiOutcome, r.requiresDualSolve, r.submittedAt,
          rev.decision, rev.errTag, rev.severity, rev.notes, rev.reviewedAt,
        ].map(csvEscape).join(','),
      )
    })
    const csv = [headers.join(','), ...rows].join('\n')
    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', 'attachment; filename="oreset-cases-export.csv"')
    res.status(200).send(csv)
    return
  }

  res.status(200).json({
    export: {
      generatedAt: new Date().toISOString(),
      totalCases: results.length,
    },
    cases: results,
  })
}

function csvEscape(val: unknown): string {
  if (val == null) return ''
  const s = String(val)
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

// ---------------------------------------------------------------------------
// Webhook Configuration
// ---------------------------------------------------------------------------

export async function listWebhooks(req: Request, res: Response) {
  const webhooks = await buyersService.getMyWebhooks(req.user!.sub)
  const safe = webhooks.map((w) => ({ ...w, secret: maskSecret(w.secret) }))
  res.status(200).json({ webhooks: safe })
}

export async function createWebhook(req: Request, res: Response) {
  const body = createWebhookSchema.parse(req.body)
  const config = await buyersService.createWebhook(req.user!.sub, body)
  res.status(201).json({ webhook: config })
}

export async function updateWebhook(req: Request, res: Response) {
  const body = updateWebhookSchema.parse(req.body)
  const config = await buyersService.updateWebhook(req.user!.sub, req.params.id, body)
  res.status(200).json({ webhook: { ...config, secret: maskSecret(config.secret) } })
}

export async function deleteWebhook(req: Request, res: Response) {
  await buyersService.deleteWebhook(req.user!.sub, req.params.id)
  res.status(204).send()
}

export async function rotateWebhookSecret(req: Request, res: Response) {
  const config = await buyersService.rotateWebhookSecret(req.user!.sub, req.params.id)
  res.status(200).json({ webhook: config })
}

function maskSecret(secret: string): string {
  return secret.slice(0, 8) + '...' + secret.slice(-4)
}
