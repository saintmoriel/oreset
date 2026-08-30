'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, User, Clock, Target, GitCompare, Globe } from 'lucide-react'
import { ERR_TAG_LABELS, SEVERITY_LABELS } from '@oreset/shared'
import type { OperatorPerformanceEntry } from '@/lib/api/endpoints/operator-performance'
import { cn } from '@/lib/utils'

type SortField = 'totalReviews' | 'reviews7d' | 'approvalRate' | 'avgReviewTimeMs' | 'calibrationAvgScore' | 'consensusAgreementRate'

function formatMs(ms: number | null): string {
  if (ms == null) return '--'
  if (ms < 60_000) return `${Math.round(ms / 1000)}s`
  return `${Math.floor(ms / 60_000)}m ${Math.round((ms % 60_000) / 1000)}s`
}

function StatusDot({ status }: { status: string }) {
  return (
    <span
      className={cn(
        'inline-block size-2 rounded-full',
        status === 'active' ? 'bg-success' : status === 'suspended' ? 'bg-destructive' : 'bg-navy-300',
      )}
    />
  )
}

function DecisionBar({ breakdown, total }: { breakdown: OperatorPerformanceEntry['decisionBreakdown']; total: number }) {
  if (total === 0) return <span className="cx-meta text-navy-400">No reviews</span>

  const segments = [
    { key: 'approved', count: breakdown.approved, color: 'bg-success' },
    { key: 'corrected', count: breakdown.corrected, color: 'bg-accent' },
    { key: 'rejected', count: breakdown.rejected, color: 'bg-destructive' },
    { key: 'escalated', count: breakdown.escalated, color: 'bg-warning' },
    { key: 'declined', count: breakdown.declined, color: 'bg-navy-300' },
  ].filter((s) => s.count > 0)

  return (
    <div className="space-y-1.5">
      <div className="flex h-2 w-full overflow-hidden rounded-full bg-navy-100">
        {segments.map((s) => (
          <div
            key={s.key}
            className={cn('h-full', s.color)}
            style={{ width: `${(s.count / total) * 100}%` }}
            title={`${s.key}: ${s.count} (${Math.round((s.count / total) * 100)}%)`}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-0.5">
        {segments.map((s) => (
          <span key={s.key} className="cx-meta text-navy-500 flex items-center gap-1">
            <span className={cn('inline-block size-1.5 rounded-full', s.color)} />
            {s.key} {s.count}
          </span>
        ))}
      </div>
    </div>
  )
}

function ErrTagList({ breakdown }: { breakdown: Record<string, number> }) {
  const tags = Object.entries(breakdown).filter(([, v]) => v > 0)
  if (tags.length === 0) return <span className="cx-meta text-navy-400">None</span>
  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map(([tag, count]) => (
        <span key={tag} className="cx-meta rounded-full bg-navy-100 px-2 py-0.5 text-navy-600">
          {tag} ({count}) {ERR_TAG_LABELS[tag as keyof typeof ERR_TAG_LABELS] ? `- ${ERR_TAG_LABELS[tag as keyof typeof ERR_TAG_LABELS]}` : ''}
        </span>
      ))}
    </div>
  )
}

function OperatorCard({ op }: { op: OperatorPerformanceEntry }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="cx-card overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-4 p-4 text-left hover:bg-navy-50/50 cx-fade"
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <StatusDot status={op.status} />
            <span className="cx-body font-semibold text-navy-900 truncate">
              {op.displayName ?? 'Unnamed'}
            </span>
            {op.operatorCode && (
              <span className="cx-mono-meta text-navy-400">{op.operatorCode}</span>
            )}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-0.5">
            <span className="cx-meta text-navy-500">{op.totalReviews} reviews</span>
            <span className="cx-meta text-navy-400">{op.reviews7d} this week</span>
            {op.avgReviewTimeMs != null && (
              <span className="cx-meta text-navy-400">avg {formatMs(op.avgReviewTimeMs)}</span>
            )}
            {op.approvalRate != null && (
              <span className="cx-meta text-navy-400">{op.approvalRate}% approval</span>
            )}
            {op.calibrationAvgScore != null && (
              <span className="cx-meta text-accent">cal {op.calibrationAvgScore}%</span>
            )}
            {op.consensusAgreementRate != null && (
              <span className="cx-meta text-success">agree {op.consensusAgreementRate}%</span>
            )}
          </div>
        </div>
        {expanded ? <ChevronUp className="size-4 text-navy-400 shrink-0" /> : <ChevronDown className="size-4 text-navy-400 shrink-0" />}
      </button>

      {expanded && (
        <div className="border-t border-border p-4 space-y-5">
          {/* Profile info */}
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="flex items-start gap-2">
              <Globe className="size-4 text-navy-400 mt-0.5 shrink-0" />
              <div>
                <p className="cx-meta font-semibold text-navy-500">Languages</p>
                <p className="cx-body text-navy-700">{op.languages.length > 0 ? op.languages.join(', ') : '--'}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <User className="size-4 text-navy-400 mt-0.5 shrink-0" />
              <div>
                <p className="cx-meta font-semibold text-navy-500">Location</p>
                <p className="cx-body text-navy-700">{op.location ?? '--'}</p>
              </div>
            </div>
            <div>
              <p className="cx-meta font-semibold text-navy-500">Joined</p>
              <p className="cx-body text-navy-700">{new Date(op.joinedAt).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Volume */}
          <div>
            <p className="cx-meta font-semibold text-navy-500 mb-2">Review Volume</p>
            <div className="grid grid-cols-4 gap-3">
              <div className="rounded-lg bg-navy-50 p-3 text-center">
                <p className="font-mono text-lg font-semibold tabular-nums text-navy-900">{op.reviewsToday}</p>
                <p className="cx-meta text-navy-400">Today</p>
              </div>
              <div className="rounded-lg bg-navy-50 p-3 text-center">
                <p className="font-mono text-lg font-semibold tabular-nums text-navy-900">{op.reviews7d}</p>
                <p className="cx-meta text-navy-400">7 days</p>
              </div>
              <div className="rounded-lg bg-navy-50 p-3 text-center">
                <p className="font-mono text-lg font-semibold tabular-nums text-navy-900">{op.reviews30d}</p>
                <p className="cx-meta text-navy-400">30 days</p>
              </div>
              <div className="rounded-lg bg-navy-50 p-3 text-center">
                <p className="font-mono text-lg font-semibold tabular-nums text-navy-900">{op.totalReviews}</p>
                <p className="cx-meta text-navy-400">All time</p>
              </div>
            </div>
          </div>

          {/* Decision distribution */}
          <div>
            <p className="cx-meta font-semibold text-navy-500 mb-2">Decision Distribution</p>
            <DecisionBar breakdown={op.decisionBreakdown} total={op.totalReviews} />
          </div>

          {/* Speed */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <Clock className="size-3.5 text-navy-400" />
                <p className="cx-meta font-semibold text-navy-500">Review Speed</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg bg-navy-50 p-2.5">
                  <p className="font-mono text-sm font-semibold text-navy-900">{formatMs(op.avgReviewTimeMs)}</p>
                  <p className="cx-meta text-navy-400">Average</p>
                </div>
                <div className="rounded-lg bg-navy-50 p-2.5">
                  <p className="font-mono text-sm font-semibold text-navy-900">{formatMs(op.medianReviewTimeMs)}</p>
                  <p className="cx-meta text-navy-400">Median</p>
                </div>
              </div>
            </div>

            {/* Calibration */}
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <Target className="size-3.5 text-navy-400" />
                <p className="cx-meta font-semibold text-navy-500">Calibration</p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-lg bg-navy-50 p-2.5">
                  <p className="font-mono text-sm font-semibold text-navy-900">{op.calibrationAttempts}</p>
                  <p className="cx-meta text-navy-400">Attempts</p>
                </div>
                <div className="rounded-lg bg-navy-50 p-2.5">
                  <p className="font-mono text-sm font-semibold text-navy-900">
                    {op.calibrationPassRate != null ? `${op.calibrationPassRate}%` : '--'}
                  </p>
                  <p className="cx-meta text-navy-400">Pass Rate</p>
                </div>
                <div className="rounded-lg bg-navy-50 p-2.5">
                  <p className="font-mono text-sm font-semibold text-navy-900">
                    {op.calibrationAvgScore != null ? `${op.calibrationAvgScore}%` : '--'}
                  </p>
                  <p className="cx-meta text-navy-400">Avg Score</p>
                </div>
              </div>
            </div>
          </div>

          {/* Consensus */}
          {op.consensusTotal > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <GitCompare className="size-3.5 text-navy-400" />
                <p className="cx-meta font-semibold text-navy-500">Consensus</p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-lg bg-navy-50 p-2.5">
                  <p className="font-mono text-sm font-semibold text-navy-900">{op.consensusTotal}</p>
                  <p className="cx-meta text-navy-400">Pairs</p>
                </div>
                <div className="rounded-lg bg-navy-50 p-2.5">
                  <p className="font-mono text-sm font-semibold text-navy-900">{op.consensusAgreed}</p>
                  <p className="cx-meta text-navy-400">Agreed</p>
                </div>
                <div className="rounded-lg bg-navy-50 p-2.5">
                  <p className="font-mono text-sm font-semibold text-navy-900">
                    {op.consensusAgreementRate != null ? `${op.consensusAgreementRate}%` : '--'}
                  </p>
                  <p className="cx-meta text-navy-400">Agreement Rate</p>
                </div>
              </div>
            </div>
          )}

          {/* Error tags */}
          <div>
            <p className="cx-meta font-semibold text-navy-500 mb-2">Error Tags Flagged</p>
            <ErrTagList breakdown={op.errTagBreakdown} />
          </div>
        </div>
      )}
    </div>
  )
}

export function OperatorPerformanceTable({ operators }: { operators: OperatorPerformanceEntry[] }) {
  const [sortField, setSortField] = useState<SortField>('totalReviews')
  const [search, setSearch] = useState('')

  const filtered = operators.filter((op) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      (op.displayName ?? '').toLowerCase().includes(q) ||
      (op.operatorCode ?? '').toLowerCase().includes(q) ||
      op.languages.some((l) => l.toLowerCase().includes(q)) ||
      (op.location ?? '').toLowerCase().includes(q)
    )
  })

  const sorted = [...filtered].sort((a, b) => {
    const av = a[sortField] ?? -1
    const bv = b[sortField] ?? -1
    return (bv as number) - (av as number)
  })

  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-center gap-3 mb-3">
        <h2 className="cx-title text-navy-900 flex-1">Operators ({operators.length})</h2>
        <input
          type="text"
          placeholder="Search by name, code, language, location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-lg border border-border bg-background px-3 py-1.5 cx-body text-navy-800 w-64"
        />
        <select
          value={sortField}
          onChange={(e) => setSortField(e.target.value as SortField)}
          className="rounded-lg border border-border bg-background px-3 py-1.5 cx-meta text-navy-700"
        >
          <option value="totalReviews">Sort: Total Reviews</option>
          <option value="reviews7d">Sort: This Week</option>
          <option value="approvalRate">Sort: Approval Rate</option>
          <option value="avgReviewTimeMs">Sort: Avg Speed</option>
          <option value="calibrationAvgScore">Sort: Calibration Score</option>
          <option value="consensusAgreementRate">Sort: Consensus Agreement</option>
        </select>
      </div>

      {sorted.length === 0 ? (
        <div className="cx-card flex flex-col items-center gap-3 p-10 text-center">
          <Users className="size-8 text-navy-300" />
          <p className="cx-body text-navy-500">
            {search ? 'No operators match your search.' : 'No operators registered yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {sorted.map((op) => (
            <OperatorCard key={op.id} op={op} />
          ))}
        </div>
      )}
    </div>
  )
}
