'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, ChevronUp, Plus, Upload, Clock, Eye } from 'lucide-react'
import { ERR_TAG_LABELS, SEVERITY_LABELS } from '@oreset/shared'
import type { BuyerCase } from '@/lib/api/endpoints/buyer-cases'
import { submitBuyerCase, getMyBuyerCases } from '@/lib/api/endpoints/buyer-cases'
import { cn } from '@/lib/utils'

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-warning/10 text-warning',
  in_review: 'bg-accent/10 text-accent',
  approved: 'bg-success/10 text-success',
  corrected: 'bg-accent/10 text-accent',
  rejected: 'bg-destructive/10 text-destructive',
  escalated: 'bg-warning/10 text-warning',
  declined: 'bg-navy-100 text-navy-500',
  consensus_split: 'bg-navy-100 text-navy-600',
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending review',
  in_review: 'In review (dual-solve)',
  approved: 'Approved',
  corrected: 'Corrected & passed',
  rejected: 'Rejected',
  escalated: 'Escalated',
  declined: 'Declined',
  consensus_split: 'Awaiting adjudication',
}

const FILTERS = ['all', 'pending', 'in_review', 'approved', 'corrected', 'rejected', 'escalated'] as const

function SubmitCaseForm({ onSubmitted }: { onSubmitted: (c: BuyerCase) => void }) {
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [clientName, setClientName] = useState('')
  const [externalRef, setExternalRef] = useState('')
  const [content, setContent] = useState('')
  const [language, setLanguage] = useState('')
  const [domain, setDomain] = useState('')
  const [aiDecision, setAiDecision] = useState('')
  const [aiOutcome, setAiOutcome] = useState('')
  const [dualSolve, setDualSolve] = useState(false)

  const handleSubmit = async () => {
    if (!clientName || !externalRef || !content) return
    setSubmitting(true)
    try {
      const traceData: Record<string, unknown> = {}
      if (language) traceData.language = language
      if (domain) traceData.domain = domain
      if (aiDecision) traceData.aiDecision = aiDecision
      if (aiOutcome) traceData.aiOutcome = aiOutcome

      const result = await submitBuyerCase({
        clientName,
        externalRef,
        content,
        traceData: Object.keys(traceData).length > 0 ? traceData : undefined,
        requiresDualSolve: dualSolve || undefined,
      })
      onSubmitted(result.item)
      setClientName('')
      setExternalRef('')
      setContent('')
      setLanguage('')
      setDomain('')
      setAiDecision('')
      setAiOutcome('')
      setDualSolve(false)
      setOpen(false)
    } catch {
      // handled by apiFetch
    }
    setSubmitting(false)
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="cx-card flex w-full items-center justify-center gap-2 p-4 text-accent hover:bg-accent/5 cx-fade"
      >
        <Plus className="size-4" />
        <span className="cx-body font-semibold">Submit a new case</span>
      </button>
    )
  }

  return (
    <div className="cx-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="cx-title text-navy-900">Submit Verification Case</h3>
        <button onClick={() => setOpen(false)} className="cx-meta text-navy-400 hover:text-navy-600">
          Cancel
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="cx-meta font-semibold text-navy-500 mb-1 block">Client / Product Name *</label>
          <input
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            placeholder="e.g. SafariPay Credit Engine"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 cx-body text-navy-800"
          />
        </div>
        <div>
          <label className="cx-meta font-semibold text-navy-500 mb-1 block">External Reference *</label>
          <input
            value={externalRef}
            onChange={(e) => setExternalRef(e.target.value)}
            placeholder="e.g. txn_5521a or case-2024-0891"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 cx-body text-navy-800"
          />
        </div>
      </div>

      <div>
        <label className="cx-meta font-semibold text-navy-500 mb-1 block">Input Content *</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="The original input in the customer's language (voice transcript, form text, chat message, etc.)"
          rows={4}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 cx-body text-navy-800 resize-none"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="cx-meta font-semibold text-navy-500 mb-1 block">Language</label>
          <input
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            placeholder="e.g. Pidgin, Yoruba, Hausa, Swahili"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 cx-body text-navy-800"
          />
        </div>
        <div>
          <label className="cx-meta font-semibold text-navy-500 mb-1 block">Domain</label>
          <select
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 cx-body text-navy-800"
          >
            <option value="">Select domain...</option>
            <option value="claims">Claims & payouts</option>
            <option value="lending">Lending & credit</option>
            <option value="healthcare">Healthcare</option>
            <option value="government">Government & public services</option>
          </select>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="cx-meta font-semibold text-navy-500 mb-1 block">AI Decision</label>
          <input
            value={aiDecision}
            onChange={(e) => setAiDecision(e.target.value)}
            placeholder="What the AI decided (e.g. 'Claim denied')"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 cx-body text-navy-800"
          />
        </div>
        <div>
          <label className="cx-meta font-semibold text-navy-500 mb-1 block">AI Outcome</label>
          <input
            value={aiOutcome}
            onChange={(e) => setAiOutcome(e.target.value)}
            placeholder="The consequence (e.g. 'No payout issued')"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 cx-body text-navy-800"
          />
        </div>
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={dualSolve}
          onChange={(e) => setDualSolve(e.target.checked)}
          className="rounded border-border"
        />
        <span className="cx-body text-navy-700">Require dual-solve (two independent reviewers)</span>
      </label>

      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={submitting || !clientName || !externalRef || !content}
          className="rounded-lg bg-accent px-5 py-2 cx-body font-semibold text-white hover:bg-accent/90 disabled:opacity-50 cx-fade"
        >
          {submitting ? 'Submitting...' : 'Submit Case'}
        </button>
      </div>
    </div>
  )
}

function CaseCard({ c }: { c: BuyerCase }) {
  const [expanded, setExpanded] = useState(false)
  const traceData = c.traceData as Record<string, unknown> | null

  return (
    <div className="cx-card overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-3 p-4 text-left hover:bg-navy-50/50 cx-fade"
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="cx-body font-semibold text-navy-900">{c.clientName}</span>
            <span className="cx-mono-meta text-navy-400">{c.externalRef}</span>
            <span className={cn('cx-meta inline-flex rounded-full px-2 py-0.5 font-semibold', STATUS_COLORS[c.status] ?? 'bg-navy-100 text-navy-500')}>
              {STATUS_LABELS[c.status] ?? c.status}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-3 flex-wrap">
            {traceData?.language && (
              <span className="cx-meta text-navy-400">{traceData.language as string}</span>
            )}
            {traceData?.domain && (
              <span className="cx-meta text-navy-400">{traceData.domain as string}</span>
            )}
            <span className="cx-meta text-navy-400">{new Date(c.createdAt).toLocaleDateString()}</span>
            {c.requiresDualSolve && (
              <span className="cx-meta rounded-full bg-accent/10 px-1.5 py-0.5 text-accent font-semibold">dual-solve</span>
            )}
          </div>
        </div>
        {expanded ? <ChevronUp className="size-4 text-navy-400 shrink-0" /> : <ChevronDown className="size-4 text-navy-400 shrink-0" />}
      </button>

      {expanded && (
        <div className="border-t border-border p-4 space-y-3">
          <div>
            <p className="cx-meta font-semibold text-navy-500 mb-1">Input Content</p>
            <div className="rounded-lg bg-navy-50 p-3">
              <p className="cx-body text-navy-800 text-sm whitespace-pre-wrap">{c.content}</p>
            </div>
          </div>

          {traceData?.aiDecision && (
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="cx-meta font-semibold text-navy-500">AI Decision</p>
                <p className="cx-body text-navy-700 mt-0.5">{traceData.aiDecision as string}</p>
              </div>
              {traceData?.aiOutcome && (
                <div>
                  <p className="cx-meta font-semibold text-navy-500">AI Outcome</p>
                  <p className="cx-body text-navy-700 mt-0.5">{traceData.aiOutcome as string}</p>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end">
            <Link
              href={`/buyer/cases/${c.id}`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-accent bg-accent/5 px-3 py-1.5 cx-meta font-semibold text-accent hover:bg-accent/10 cx-fade"
            >
              <Eye className="size-3.5" />
              View full details
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

export function CasesList({ initialCases }: { initialCases: BuyerCase[] }) {
  const [cases, setCases] = useState(initialCases)
  const [filter, setFilter] = useState<string>('all')
  const [loading, setLoading] = useState(false)

  const handleFilterChange = async (f: string) => {
    setFilter(f)
    setLoading(true)
    try {
      const res = await getMyBuyerCases(f)
      setCases(res.cases)
    } catch {
      // handled by apiFetch
    }
    setLoading(false)
  }

  const handleSubmitted = (c: BuyerCase) => {
    setCases((prev) => [c, ...prev])
  }

  return (
    <div className="mt-6 space-y-4">
      <SubmitCaseForm onSubmitted={handleSubmitted} />

      <div className="flex items-center gap-2 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => handleFilterChange(f)}
            className={cn(
              'cx-meta rounded-full px-3 py-1 font-semibold cx-fade',
              filter === f
                ? 'bg-accent text-white'
                : 'bg-navy-100 text-navy-500 hover:bg-navy-200',
            )}
          >
            {f === 'all' ? 'All' : STATUS_LABELS[f] ?? f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="cx-card p-8 text-center">
          <p className="cx-body text-navy-400">Loading...</p>
        </div>
      ) : cases.length === 0 ? (
        <div className="cx-card flex flex-col items-center gap-3 p-10 text-center">
          <Upload className="size-8 text-navy-300" />
          <p className="cx-body text-navy-500">No cases yet. Submit your first case above.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {cases.map((c) => (
            <CaseCard key={c.id} c={c} />
          ))}
        </div>
      )}
    </div>
  )
}
