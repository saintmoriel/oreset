import { and, avg, count, desc, eq, sql } from 'drizzle-orm'
import type { ErrTag, OperatorDecision, Severity } from '@oreset/shared'
import { db } from '../../db/client'
import { calibrationCases, calibrationAttempts } from '../../db/schema'
import { HttpError } from '../../middleware/error-handler'

// ---------------------------------------------------------------------------
// Admin: manage gold-standard calibration cases
// ---------------------------------------------------------------------------

export async function createCase(input: {
  title: string
  content: string
  traceData?: Record<string, unknown>
  expectedDecision: OperatorDecision
  expectedErrTag?: ErrTag
  expectedSeverity?: Severity
  expectedOutcome?: string
  explanation: string
  domain?: string
  language?: string
  createdBy: string
}) {
  const [created] = await db
    .insert(calibrationCases)
    .values({
      title: input.title,
      content: input.content,
      traceData: input.traceData ?? null,
      expectedDecision: input.expectedDecision,
      expectedErrTag: input.expectedErrTag,
      expectedSeverity: input.expectedSeverity,
      expectedOutcome: input.expectedOutcome,
      explanation: input.explanation,
      domain: input.domain,
      language: input.language,
      createdBy: input.createdBy,
    })
    .returning()

  return created
}

export async function listCases() {
  return db.query.calibrationCases.findMany({
    orderBy: desc(calibrationCases.createdAt),
    with: { createdByUser: { columns: { displayName: true } } },
  })
}

export async function retireCase(caseId: string) {
  const [updated] = await db
    .update(calibrationCases)
    .set({ status: 'retired' })
    .where(eq(calibrationCases.id, caseId))
    .returning()
  if (!updated) throw new HttpError(404, 'not_found', 'Calibration case not found.')
  return updated
}

// ---------------------------------------------------------------------------
// Operator: take calibration round
// ---------------------------------------------------------------------------

export async function getNextCase(operatorId: string) {
  const attempted = db
    .select({ caseId: calibrationAttempts.calibrationCaseId })
    .from(calibrationAttempts)
    .where(eq(calibrationAttempts.operatorId, operatorId))

  const nextCase = await db.query.calibrationCases.findFirst({
    where: and(
      eq(calibrationCases.status, 'active'),
      sql`${calibrationCases.id} NOT IN (${attempted})`,
    ),
  })

  if (!nextCase) return null

  // Return without the expected answers
  return {
    id: nextCase.id,
    title: nextCase.title,
    content: nextCase.content,
    traceData: nextCase.traceData,
    domain: nextCase.domain,
    language: nextCase.language,
  }
}

export async function submitAttempt(input: {
  calibrationCaseId: string
  operatorId: string
  decision: OperatorDecision
  errTag?: ErrTag
  severity?: Severity
  correctedOutcome?: string
  notes?: string
  reviewTimeMs?: number
}) {
  const goldCase = await db.query.calibrationCases.findFirst({
    where: eq(calibrationCases.id, input.calibrationCaseId),
  })
  if (!goldCase) throw new HttpError(404, 'not_found', 'Calibration case not found.')

  const existing = await db.query.calibrationAttempts.findFirst({
    where: and(
      eq(calibrationAttempts.calibrationCaseId, input.calibrationCaseId),
      eq(calibrationAttempts.operatorId, input.operatorId),
    ),
  })
  if (existing) throw new HttpError(409, 'already_attempted', 'You have already attempted this case.')

  // Score: decision match = 60%, errTag match = 20%, severity match = 20%
  let score = 0
  if (input.decision === goldCase.expectedDecision) score += 0.6
  if (goldCase.expectedErrTag && input.errTag === goldCase.expectedErrTag) score += 0.2
  else if (!goldCase.expectedErrTag && !input.errTag) score += 0.2
  if (goldCase.expectedSeverity && input.severity === goldCase.expectedSeverity) score += 0.2
  else if (!goldCase.expectedSeverity && !input.severity) score += 0.2

  const result = score >= 0.6 ? 'pass' as const : 'fail' as const

  const [attempt] = await db
    .insert(calibrationAttempts)
    .values({
      calibrationCaseId: input.calibrationCaseId,
      operatorId: input.operatorId,
      decision: input.decision,
      errTag: input.errTag,
      severity: input.severity,
      correctedOutcome: input.correctedOutcome,
      notes: input.notes,
      reviewTimeMs: input.reviewTimeMs,
      result,
      score,
    })
    .returning()

  return {
    attempt,
    feedback: {
      result,
      score: Math.round(score * 100),
      expectedDecision: goldCase.expectedDecision,
      expectedErrTag: goldCase.expectedErrTag,
      expectedSeverity: goldCase.expectedSeverity,
      explanation: goldCase.explanation,
    },
  }
}

// ---------------------------------------------------------------------------
// Operator: my calibration history
// ---------------------------------------------------------------------------

export async function getOperatorCalibration(operatorId: string) {
  const attempts = await db.query.calibrationAttempts.findMany({
    where: eq(calibrationAttempts.operatorId, operatorId),
    orderBy: desc(calibrationAttempts.createdAt),
    with: { calibrationCase: { columns: { title: true, expectedDecision: true } } },
  })

  const totalAttempts = attempts.length
  const passed = attempts.filter((a) => a.result === 'pass').length
  const avgScore = totalAttempts > 0
    ? Math.round(attempts.reduce((sum, a) => sum + a.score, 0) / totalAttempts * 100)
    : null

  return { attempts, totalAttempts, passed, failed: totalAttempts - passed, avgScore }
}

// ---------------------------------------------------------------------------
// Admin: inter-rater agreement stats
// ---------------------------------------------------------------------------

export async function getCalibrationStats() {
  const [totalCases] = await db
    .select({ count: count() })
    .from(calibrationCases)
    .where(eq(calibrationCases.status, 'active'))

  const [totalAttempts] = await db
    .select({ count: count() })
    .from(calibrationAttempts)

  const [passRate] = await db
    .select({
      total: count(),
      passed: sql<number>`count(*) filter (where result = 'pass')`,
    })
    .from(calibrationAttempts)

  const [avgScoreResult] = await db
    .select({ avg: avg(calibrationAttempts.score) })
    .from(calibrationAttempts)

  // Per-operator stats
  const operatorStats = await db
    .select({
      operatorId: calibrationAttempts.operatorId,
      attempts: count(),
      passed: sql<number>`count(*) filter (where result = 'pass')`,
      avgScore: avg(calibrationAttempts.score),
    })
    .from(calibrationAttempts)
    .groupBy(calibrationAttempts.operatorId)

  return {
    activeCases: totalCases?.count ?? 0,
    totalAttempts: totalAttempts?.count ?? 0,
    overallPassRate: passRate?.total
      ? Math.round((passRate.passed / passRate.total) * 100)
      : null,
    avgScore: avgScoreResult?.avg ? Math.round(Number(avgScoreResult.avg) * 100) : null,
    operatorStats: operatorStats.map((o) => ({
      operatorId: o.operatorId,
      attempts: o.attempts,
      passed: o.passed,
      passRate: o.attempts > 0 ? Math.round((o.passed / o.attempts) * 100) : 0,
      avgScore: o.avgScore ? Math.round(Number(o.avgScore) * 100) : 0,
    })),
  }
}
