'use client'

import { useCallback, useState, useTransition } from 'react'
import { ChevronDown, ChevronUp, Download, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { StatusTag } from '@/components/capture/status-tag'
import { VULN_TAG_LABELS, SEVERITY_LABELS, EXPLOIT_STATUS_LABELS } from '@oreset/shared'
import { getRegressionSuite } from '@/lib/api/endpoints/regressions'
import type { RegressionTestCase } from '@/lib/api/endpoints/regressions'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'

export function RegressionExplorer({ clients }: { clients: string[] }) {
  const [testCases, setTestCases] = useState<RegressionTestCase[]>([])
  const [loaded, setLoaded] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [clientFilter, setClientFilter] = useState<string>('')
  const [isPending, startTransition] = useTransition()

  const load = useCallback(() => {
    startTransition(async () => {
      const res = await getRegressionSuite(clientFilter ? { client: clientFilter } : undefined)
      setTestCases(res.test_cases)
      setLoaded(true)
    })
  }, [clientFilter])

  function downloadUrl(format: 'json' | 'jsonl') {
    const params = new URLSearchParams({ format })
    if (clientFilter) params.set('client', clientFilter)
    return `${API_BASE}/api/v1/admin/regressions?${params}`
  }

  return (
    <div className="mt-6">
      {/* Controls */}
      <div className="flex flex-wrap items-end gap-3">
        {clients.length > 0 && (
          <div>
            <label className="cx-meta mb-1 block font-medium text-navy-500">
              Filter by client
            </label>
            <select
              value={clientFilter}
              onChange={(e) => setClientFilter(e.target.value)}
              className="cx-body h-9 rounded-lg border border-border bg-card px-3 text-navy-800"
            >
              <option value="">All clients</option>
              {clients.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        )}

        <button
          onClick={load}
          disabled={isPending}
          className={cn(
            'cx-body inline-flex h-9 items-center gap-2 rounded-lg px-4 font-medium text-white cx-fade',
            isPending ? 'bg-navy-300 cursor-wait' : 'bg-accent hover:bg-accent/90',
          )}
        >
          <Search className="size-4" />
          {isPending ? 'Loading…' : loaded ? 'Refresh' : 'Load Test Cases'}
        </button>

        {loaded && testCases.length > 0 && (
          <div className="flex items-center gap-2 ml-auto">
            <a
              href={downloadUrl('json')}
              className="cx-body inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-card px-3 font-medium text-navy-700 hover:bg-navy-50 cx-fade"
            >
              <Download className="size-4" />
              JSON
            </a>
            <a
              href={downloadUrl('jsonl')}
              className="cx-body inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-card px-3 font-medium text-navy-700 hover:bg-navy-50 cx-fade"
            >
              <Download className="size-4" />
              JSONL
            </a>
          </div>
        )}
      </div>

      {/* Results */}
      {loaded && (
        <div className="mt-4">
          <p className="cx-meta text-navy-400 mb-3">
            {testCases.length} test case{testCases.length === 1 ? '' : 's'}
          </p>

          {testCases.length === 0 ? (
            <p className="cx-body text-navy-400">
              No regression test cases found. Each exploit a tester confirms becomes a test case.
            </p>
          ) : (
            <div className="space-y-2">
              {testCases.map((tc) => {
                const isExpanded = expandedId === tc.test_case_id
                return (
                  <div
                    key={tc.test_case_id}
                    className="rounded-xl border border-border bg-card overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : tc.test_case_id)}
                      className="flex w-full items-start justify-between gap-4 p-4 text-left hover:bg-navy-50/40"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="cx-mono-meta font-semibold text-navy-800">
                            {tc.test_case_id}
                          </span>
                          {tc.severity && (
                            <span className="rounded bg-destructive/10 px-1.5 py-0.5 font-mono text-[10px] font-bold text-destructive">
                              {tc.severity}
                            </span>
                          )}
                          {tc.vuln_tag && <StatusTag tone="warning">{tc.vuln_tag}</StatusTag>}
                          {tc.exploit_status === 'partial_bypass' ? (
                            <StatusTag tone="neutral">Partial bypass</StatusTag>
                          ) : (
                            <StatusTag tone="destructive">Exploited</StatusTag>
                          )}
                          {tc.domain && (
                            <span className="rounded bg-navy-100 px-1.5 py-0.5 text-[10px] font-semibold text-navy-500 uppercase">
                              {tc.domain}
                            </span>
                          )}
                          {tc.language && (
                            <span className="rounded bg-navy-100 px-1.5 py-0.5 text-[10px] font-semibold text-navy-500">
                              {tc.language}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-3 mt-1">
                          {tc.client_name && (
                            <p className="cx-meta text-navy-500">{tc.client_name}</p>
                          )}
                          <p className="cx-mono-meta text-navy-400">
                            {new Date(tc.reviewed_at).toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="size-4 shrink-0 text-navy-400" />
                      ) : (
                        <ChevronDown className="size-4 shrink-0 text-navy-400" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="border-t border-border px-4 pb-4 pt-3 space-y-3">
                        {tc.attack_prompt && (
                          <Field label="Attack Prompt" value={tc.attack_prompt} />
                        )}
                        {tc.model_response && (
                          <Field label="Model Response" value={tc.model_response} />
                        )}
                        {(tc.vuln_tag || tc.severity || tc.exploit_status) && (
                          <div className="rounded-lg border border-border bg-navy-50 p-3">
                            <p className="text-[11px] font-medium uppercase tracking-wider text-navy-400 mb-1">
                              Classification
                            </p>
                            <div className="space-y-1">
                              {tc.vuln_tag && (
                                <p className="cx-body text-navy-800">
                                  <span className="font-semibold">{tc.vuln_tag}</span>: {VULN_TAG_LABELS[tc.vuln_tag]}
                                </p>
                              )}
                              {tc.severity && (
                                <p className="cx-meta text-navy-600">{tc.severity}: {SEVERITY_LABELS[tc.severity]}</p>
                              )}
                              {tc.exploit_status && (
                                <p className="cx-meta text-navy-600">{EXPLOIT_STATUS_LABELS[tc.exploit_status]}</p>
                              )}
                            </div>
                          </div>
                        )}
                        {tc.reproduction_steps && (
                          <Field label="Reproduction Steps" value={tc.reproduction_steps} />
                        )}
                        {tc.recommended_fix && (
                          <Field label="Recommended Fix" value={tc.recommended_fix} accent />
                        )}
                        {tc.reviewer_notes && (
                          <Field label="Tester Notes" value={tc.reviewer_notes} />
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function Field({
  label,
  value,
  accent,
}: {
  label: string
  value: string
  accent?: boolean
}) {
  return (
    <div
      className={cn(
        'rounded-lg border p-3',
        accent ? 'border-accent/20 bg-accent/5' : 'border-border bg-navy-50',
      )}
    >
      <p
        className={cn(
          'text-[11px] font-medium uppercase tracking-wider mb-1',
          accent ? 'text-accent' : 'text-navy-400',
        )}
      >
        {label}
      </p>
      <p className="cx-body text-navy-800 whitespace-pre-wrap leading-relaxed">{value}</p>
    </div>
  )
}
