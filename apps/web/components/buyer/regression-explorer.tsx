'use client'

import { useState } from 'react'
import { Download, RefreshCw, ChevronDown, ChevronUp, FlaskConical } from 'lucide-react'
import { ERR_TAG_LABELS, SEVERITY_LABELS } from '@oreset/shared'
import type { BuyerRegressionTestCase } from '@/lib/api/endpoints/buyer-cases'
import { getMyBuyerRegressions } from '@/lib/api/endpoints/buyer-cases'
import { cn } from '@/lib/utils'

function TestCaseCard({ tc }: { tc: BuyerRegressionTestCase }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="cx-card overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-3 p-4 text-left hover:bg-navy-50/50 cx-fade"
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="cx-mono-meta text-navy-400">{tc.testCaseId}</span>
            <span className="cx-mono-meta text-navy-400">{tc.externalRef}</span>
            <span className={cn(
              'cx-meta inline-flex rounded-full px-2 py-0.5 font-semibold',
              tc.decision === 'rejected' ? 'bg-destructive/10 text-destructive' : 'bg-accent/10 text-accent',
            )}>
              {tc.decision}
            </span>
            {tc.errTag && (
              <span className="cx-meta rounded-full bg-navy-100 px-2 py-0.5 text-navy-600">{tc.errTag}</span>
            )}
          </div>
          <div className="mt-1 flex gap-3 flex-wrap">
            {tc.language && <span className="cx-meta text-navy-400">{tc.language}</span>}
            {tc.domain && <span className="cx-meta text-navy-400">{tc.domain}</span>}
            <span className="cx-meta text-navy-400">{new Date(tc.reviewedAt).toLocaleDateString()}</span>
          </div>
        </div>
        {expanded ? <ChevronUp className="size-4 text-navy-400 shrink-0" /> : <ChevronDown className="size-4 text-navy-400 shrink-0" />}
      </button>

      {expanded && (
        <div className="border-t border-border p-4 space-y-3">
          {tc.sourceInput && (
            <div>
              <p className="cx-meta font-semibold text-navy-500 mb-1">Source Input</p>
              <div className="rounded-lg bg-navy-50 p-3">
                <p className="cx-body text-navy-800 text-sm whitespace-pre-wrap">{tc.sourceInput}</p>
              </div>
            </div>
          )}
          {tc.modelOutput && (
            <div>
              <p className="cx-meta font-semibold text-navy-500 mb-1">Model Output</p>
              <p className="cx-body text-navy-700 text-sm">{tc.modelOutput}</p>
            </div>
          )}
          {tc.groundTruth && (
            <div>
              <p className="cx-meta font-semibold text-accent mb-1">Ground Truth (Corrected)</p>
              <p className="cx-body text-navy-700 text-sm">{tc.groundTruth}</p>
            </div>
          )}
          {tc.correctedTranscript && (
            <div>
              <p className="cx-meta font-semibold text-navy-500 mb-1">Corrected Transcript</p>
              <p className="cx-body text-navy-700 text-sm">{tc.correctedTranscript}</p>
            </div>
          )}
          {tc.correctedIntent && (
            <div>
              <p className="cx-meta font-semibold text-navy-500 mb-1">Corrected Intent</p>
              <p className="cx-body text-navy-700 text-sm">{tc.correctedIntent}</p>
            </div>
          )}
          {(tc.errTag || tc.severity) && (
            <div className="flex gap-3">
              {tc.errTag && (
                <span className="cx-meta text-navy-600">{tc.errTag} - {ERR_TAG_LABELS[tc.errTag]}</span>
              )}
              {tc.severity && (
                <span className="cx-meta text-navy-600">{SEVERITY_LABELS[tc.severity]}</span>
              )}
            </div>
          )}
          {tc.reviewerNotes && (
            <div>
              <p className="cx-meta font-semibold text-navy-500 mb-1">Reviewer Notes</p>
              <p className="cx-body text-navy-700 text-sm">{tc.reviewerNotes}</p>
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
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={handleLoad}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 cx-body font-semibold text-white hover:bg-accent/90 disabled:opacity-50 cx-fade"
        >
          <RefreshCw className={cn('size-4', loading && 'animate-spin')} />
          {loaded ? 'Refresh' : 'Load Regression Suite'}
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
            <span className="cx-meta text-navy-400">{testCases.length} test cases</span>
          </>
        )}
      </div>

      {loaded && testCases.length === 0 && (
        <div className="cx-card flex flex-col items-center gap-3 p-10 text-center">
          <FlaskConical className="size-8 text-navy-300" />
          <p className="cx-body text-navy-500">
            No regression test cases yet. Cases appear here after reviewers reject or correct your AI output.
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
