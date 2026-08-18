import type { Submission } from '../../db/schema'

export type ValidationOutcome = { outcome: 'pass' | 'fail'; reason: string | null; score: number }

// Phase 0 stub: simple rule-based check, isolated behind this one function
// signature so swapping in Favor's real ERR-01..04 FastAPI service later
// (an internal HTTP call) is a one-file change, not a refactor of anything
// that calls this.
export async function validateSubmission(submission: Submission): Promise<ValidationOutcome> {
  if (submission.fileSizeBytes < 1024) {
    return { outcome: 'fail', reason: 'ERR-04: file too small, likely corrupt or empty', score: 0 }
  }

  // ~15% random fail rate so the fail path is exercisable without needing
  // a crafted input, matching the two-outcome demo buttons in the
  // /capture/validation prototype screen this will eventually replace.
  const passed = Math.random() > 0.15
  return passed
    ? { outcome: 'pass', reason: null, score: 0.9 }
    : { outcome: 'fail', reason: 'ERR-01: acoustic/environmental noise (stub)', score: 0.3 }
}
