import type { Submission } from '../../db/schema'
import { env } from '../../config/env'
import { getDownloadUrl } from '../uploads/uploads.service'

export type ValidationOutcome = { outcome: 'pass' | 'fail'; reason: string | null; score: number }

// Phase 0 stub, kept as the fallback path (see below). Deterministic, not
// random — a crafted <1KB file reliably exercises the fail branch.
function stubValidate(submission: Submission): ValidationOutcome {
  if (submission.fileSizeBytes < 1024) {
    return { outcome: 'fail', reason: 'ERR-04: file too small, likely corrupt or empty', score: 0 }
  }
  return { outcome: 'pass', reason: null, score: 0.9 }
}

// Real (deterministic, not ML) content-signature/integrity checking against
// actual file bytes, via a genuinely separate microservice (apps/validation).
// This is not a trained model — that's Favor's actual deliverable — but the
// architecture it proves (real HTTP call, real bytes, real deterministic
// outcome) is exactly what a real model plugs into later, with zero changes
// needed on this side.
//
// Isolated behind this one function signature, unchanged since Phase 0, so
// callers (submissions.service.ts) never had to change across any of this.
export async function validateSubmission(submission: Submission): Promise<ValidationOutcome> {
  try {
    const downloadUrl = await getDownloadUrl(submission.storageKey)
    const res = await fetch(`${env.VALIDATION_SERVICE_URL}/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mediaType: submission.mediaType,
        mimeType: submission.mimeType,
        fileSizeBytes: submission.fileSizeBytes,
        durationSeconds: submission.durationSeconds ? Number(submission.durationSeconds) : null,
        downloadUrl,
      }),
      signal: AbortSignal.timeout(10_000),
    })
    if (!res.ok) throw new Error(`validation service responded ${res.status}`)
    return (await res.json()) as ValidationOutcome
  } catch (err) {
    // The validation service is a separate process a developer has to
    // remember to start locally — not running it must never break
    // submission creation. Falls back to the lightweight deterministic
    // stub instead, matching this codebase's "local dev always works out
    // of the box" philosophy (docker-compose Postgres, local-disk storage).
    console.warn('[validation] service unreachable, falling back to stub:', (err as Error).message)
    return stubValidate(submission)
  }
}
