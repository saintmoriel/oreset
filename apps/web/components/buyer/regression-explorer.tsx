'use client'

import { useState } from 'react'
import { Download, RefreshCw, ChevronDown, ChevronUp, FlaskConical } from 'lucide-react'
import { VULN_TAG_LABELS, SEVERITY_LABELS, EXPLOIT_STATUS_LABELS } from '@oreset/shared'
import type { Severity } from '@oreset/shared'
import type { BuyerRegressionTestCase } from '@/lib/api/endpoints/buyer-cases'
import { getMyBuyerRegressions } from '@/lib/api/endpoints/buyer-cases'
import { cn } from '@/lib/utils'

const SEVERITY_TONE: Record<Severity, string> = {
  P0: 'bg-destructive text-white',
  P1: 'bg-destructive/15 text-destructive',
  P2: 'bg-warning/15 text-warning',
  P3: 'bg-navy-100 text-navy-600',
}

function TestCaseCard({ tc }: { tc: BuyerRegressionTestCase }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="cx-card overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-3 p-4 text-left hover:bg-navy-50/50 cx-fade"
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="cx-mono-meta font-semibold text-navy-700">{tc.testCaseId}</span>
            <span className="cx-mono-meta text-navy-400">{tc.externalRef}</span>
            {tc.severity && (
              <span className={cn('rounded px-1.5 py-0.5 font-mono text-[11px] font-bold', SEVERITY_TONE[tc.severity])}>{tc.severity}</span>
            )}
            {tc.vulnTag && (
              <span className="cx-meta rounded-full bg-accent/10 px-2 py-0.5 font-semibold text-accent">{tc.vulnTag}</span>
            )}
          </div>
          <div className="mt-1 flex flex-wrap gap-3">
            {tc.vulnTag && <span className="cx-meta text-navy-500">{VULN_TAG_LABELS[tc.vulnTag]}</span>}
            {tc.language && <span className="cx-meta text-navy-400">{tc.language}</span>}
            {tc.domain && <span className="cx-meta text-navy-400">{tc.domain}</span>}
            <span className="cx-meta text-navy-400">{new Date(tc.reviewedAt).toLocaleDateString()}</span>
          </div>
        </div>
        {expanded ? <ChevronUp className="size-4 shrink-0 text-navy-400" /> : <ChevronDown className="size-4 shrink-0 text-navy-400" />}
      </button>

      {expanded && (
        <div className="space-y-3 border-t border-border p-4">
          {tc.attackPrompt && (
            <div>
              <p className="cx-meta mb-1 font-semibold text-navy-500">Attack prompt</p>
              <div className="rounded-lg bg-navy-50 p-3">
                <p className="cx-body whitespace-pre-wrap text-sm text-navy-800">{tc.attackPrompt}</p>
              </div>
            </div>
          )}
          {tc.modelResponse && (
            <div>
              <p className="cx-meta mb-1 font-semibold text-navy-500">Model response that failed</p>
              <p className="cx-body whitespace-pre-wrap text-sm text-navy-700">{tc.modelResponse}</p>
            </div>
          )}
          <div className="flex flex-wrap gap-4">
            {tc.exploitStatus && (
              <span className="cx-meta text-navy-600">{EXPLOIT_STATUS_LABELS[tc.exploitStatus]}</span>
            )}
            {tc.severity && <span className="cx-meta text-navy-600">{tc.severity}: {SEVERITY_LABELS[tc.severity]}</span>}
          </div>
          {tc.reproductionSteps && (
            <div>
              <p className="cx-meta mb-1 font-semibold text-navy-500">Reproduction steps</p>
              <p className="cx-body whitespace-pre-wrap text-sm text-navy-700">{tc.reproductionSteps}</p>
            </div>
          )}
          {tc.recommendedFix && (
            <div>
              <p className="cx-meta mb-1 font-semibold text-accent">Recommended fix</p>
              <p className="cx-body whitespace-pre-wrap text-sm text-navy-700">{tc.recommendedFix}</p>
            </div>
          )}
          {tc.reviewerNotes && (
            <div>
              <p className="cx-meta mb-1 font-semibold text-navy-500">Tester notes</p>
              <p className="cx-body whitespace-pre-wrap text-sm text-navy-700">{tc.reviewerNotes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function BuyerRegressionExplorer() {
  const [testCases, setTestCases] = useState<BuyerRegressionTestCase[]>([])
  const [loading, setLoading] = useState(false)
  const [loaded, setLoaded] = useState(false)

  const handleLoad = async () => {
    setLoading(true)
    try {
      const res = await getMyBuyerRegressions('json')
      setTestCases(res.testCases)
      setLoaded(true)
    } catch {
      // handled by apiFetch
    }
    setLoading(false)
  }

  const handleDownload = (format: 'json' | 'jsonl') => {
    const content = format === 'jsonl'
      ? testCases.map((tc) => JSON.stringify(tc)).join('\n')
      : JSON.stringify({ testCases }, null, 2)

    const blob = new Blob([content], { type: format === 'jsonl' ? 'application/x-ndjson' : 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `oreset-regression-suite.${format === 'jsonl' ? 'jsonl' : 'json'}`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="mt-6 space-y-4">
      <div className="rounded-lg border border-accent/20 bg-accent/5 p-4">
        <p className="cx-body font-semibold text-navy-900">Run our attacks on every deploy</p>
        <p className="cx-meta mt-1 text-navy-600">
          Every confirmed exploit becomes a test case. Pull this suite into your CI pipeline (GitHub Actions, GitLab CI, anything
          that can read JSON or JSONL) and replay the exact prompts against your agent after each change. If a closed finding
          starts landing again, you find out before your users do.
        </p>
        <p className="cx-mono-meta mt-2 text-navy-500">GET /api/v1/buyer/regressions?format=jsonl with an API token from Integrations</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={handleLoad}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 cx-body font-semibold text-white hover:bg-accent/90 disabled:opacity-50 cx-fade"
        >
          <RefreshCw className={cn('size-4', loading && 'animate-spin')} />
          {loaded ? 'Refresh' : 'Load regression suite'}
        </button>

        {loaded && testCases.length > 0 && (
          <>
            <button
              onClick={() => handleDownload('json')}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 cx-meta font-semibold text-navy-600 hover:bg-navy-50 cx-fade"
            >
              <Download className="size-3.5" />
              JSON
            </button>
            <button
              onClick={() => handleDownload('jsonl')}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 cx-meta font-semibold text-navy-600 hover:bg-navy-50 cx-fade"
            >
              <Download className="size-3.5" />
              JSONL
            </button>
            <span className="cx-meta text-navy-400">{testCases.length} test case{testCases.length === 1 ? '' : 's'}</span>
          </>
        )}
      </div>

      {loaded && testCases.length === 0 && (
        <div className="cx-card flex flex-col items-center gap-3 p-10 text-center">
          <FlaskConical className="size-8 text-navy-300" />
          <p className="cx-body text-navy-500">
            No regression cases yet. Each exploit the red team confirms against your agent is added here automatically.
          </p>
        </div>
      )}

      {testCases.length > 0 && (
        <div className="space-y-2">
          {testCases.map((tc) => (
            <TestCaseCard key={tc.testCaseId} tc={tc} />
          ))}
        </div>
      )}
    </div>
  )
}
