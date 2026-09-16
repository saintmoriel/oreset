'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, ChevronUp, Plus, Crosshair, Eye, RotateCcw } from 'lucide-react'
import type { BuyerCase } from '@/lib/api/endpoints/buyer-cases'
import { submitBuyerCase, getMyBuyerCases } from '@/lib/api/endpoints/buyer-cases'
import { cn } from '@/lib/utils'

export const SCENARIO_STATUS_TONE: Record<string, string> = {
  pending: 'bg-warning/10 text-warning',
  in_review: 'bg-accent/10 text-accent',
  consensus_split: 'bg-navy-100 text-navy-600',
  exploited: 'bg-destructive/10 text-destructive',
  defended: 'bg-success/10 text-success',
  escalated: 'bg-warning/10 text-warning',
  inconclusive: 'bg-navy-100 text-navy-500',
}

export const SCENARIO_STATUS_LABEL: Record<string, string> = {
  pending: 'Queued',
  in_review: 'In progress (dual-solve)',
  consensus_split: 'Awaiting adjudication',
  exploited: 'Exploited',
  defended: 'Defended',
  escalated: 'With lead auditor',
  inconclusive: 'Inconclusive',
}

const FILTERS = ['all', 'pending', 'exploited', 'defended', 'escalated', 'inconclusive'] as const

const SHOW_SUBMIT_FORM = false

const DOMAINS = [
  ['fintech', 'Fintech'],
  ['payments', 'Payments'],
  ['lending', 'Lending and credit'],
  ['claims', 'Claims and payouts'],
  ['healthcare', 'Healthcare'],
  ['government', 'Government and public services'],
  ['other', 'Other'],
] as const

const inputClass =
  'w-full rounded-lg border border-border bg-background px-3 py-2 cx-body text-navy-800 placeholder:text-navy-300 focus:border-accent/50 focus:outline-none'

function SubmitScenarioForm({ onSubmitted }: { onSubmitted: (c: BuyerCase) => void }) {
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [clientName, setClientName] = useState('')
  const [externalRef, setExternalRef] = useState('')
  const [content, setContent] = useState('')
  const [targetEndpoint, setTargetEndpoint] = useState('')
  const [attackType, setAttackType] = useState('')
  const [modelId, setModelId] = useState('')
  const [domain, setDomain] = useState('')
  const [language, setLanguage] = useState('')
  const [aiDecision, setAiDecision] = useState('')
  const [aiOutcome, setAiOutcome] = useState('')
  const [toolCallsJson, setToolCallsJson] = useState('')
  const [dualSolve, setDualSolve] = useState(false)

  function reset() {
    setClientName(''); setExternalRef(''); setContent(''); setTargetEndpoint(''); setAttackType('')
    setModelId(''); setDomain(''); setLanguage(''); setAiDecision(''); setAiOutcome(''); setToolCallsJson('')
    setDualSolve(false); setError(null)
  }

  const handleSubmit = async () => {
    if (!clientName || !externalRef || !content) return
    setError(null)

    const traceData: Record<string, unknown> = { input: content }
    if (targetEndpoint) traceData.targetEndpoint = targetEndpoint
    if (attackType) traceData.attackType = attackType
    if (modelId) traceData.modelId = modelId
    if (domain) traceData.domain = domain
    if (language) traceData.language = language
    if (aiDecision) traceData.aiDecision = aiDecision
    if (aiOutcome) traceData.aiOutcome = aiOutcome
    if (toolCallsJson.trim()) {
      try {
        const parsed = JSON.parse(toolCallsJson)
        if (!Array.isArray(parsed)) throw new Error('not an array')
        traceData.toolCalls = parsed
      } catch {
        setError('Tool calls must be a JSON array, for example [{"function":"transfer_funds","args":{"amount":500},"authorized":false}].')
        return
      }
    }

    setSubmitting(true)
    try {
      const result = await submitBuyerCase({
        clientName,
        externalRef,
        content,
        traceData,
        requiresDualSolve: dualSolve || undefined,
      })
      onSubmitted(result.item)
      reset()
      setOpen(false)
    } catch {
      setError('Could not submit the scenario.')
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
        <span className="cx-body font-semibold">Submit an attack scenario</span>
      </button>
    )
  }

  return (
    <div className="cx-card space-y-4 p-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="cx-title text-navy-900">Submit attack scenario</h3>
          <p className="cx-meta mt-0.5 text-navy-500">
            Most scenarios are authored by the Oreset Red Team. Use this to hand us a specific interaction you want assessed.
          </p>
        </div>
        <button onClick={() => { setOpen(false); reset() }} className="cx-meta text-navy-400 hover:text-navy-600">
          Cancel
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="cx-meta mb-1 block font-semibold text-navy-500">Agent or product name *</label>
          <input value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="e.g. SafariPay support agent" className={inputClass} />
        </div>
        <div>
          <label className="cx-meta mb-1 block font-semibold text-navy-500">Scenario ID *</label>
          <input value={externalRef} onChange={(e) => setExternalRef(e.target.value)} placeholder="e.g. scn-2026-0042" className={inputClass} />
        </div>
      </div>

      <div>
        <label className="cx-meta mb-1 block font-semibold text-navy-500">Attack prompt *</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="The exact input sent to the agent. Include the full conversation if the attack spans several turns."
          rows={4}
          className={cn(inputClass, 'resize-none')}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label className="cx-meta mb-1 block font-semibold text-navy-500">Target endpoint</label>
          <input value={targetEndpoint} onChange={(e) => setTargetEndpoint(e.target.value)} placeholder="POST /v1/agent/chat" className={cn(inputClass, 'font-mono')} />
        </div>
        <div>
          <label className="cx-meta mb-1 block font-semibold text-navy-500">Attack type</label>
          <input value={attackType} onChange={(e) => setAttackType(e.target.value)} placeholder="e.g. Direct injection, role-play jailbreak" className={inputClass} />
        </div>
        <div>
          <label className="cx-meta mb-1 block font-semibold text-navy-500">Model</label>
          <input value={modelId} onChange={(e) => setModelId(e.target.value)} placeholder="e.g. gpt-4.1, claude-sonnet-5" className={cn(inputClass, 'font-mono')} />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="cx-meta mb-1 block font-semibold text-navy-500">Domain</label>
          <select value={domain} onChange={(e) => setDomain(e.target.value)} className={inputClass}>
            <option value="">Select domain</option>
            {DOMAINS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <div>
          <label className="cx-meta mb-1 block font-semibold text-navy-500">Language of the attack</label>
          <input value={language} onChange={(e) => setLanguage(e.target.value)} placeholder="e.g. English, Pidgin, Hausa, Swahili" className={inputClass} />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="cx-meta mb-1 block font-semibold text-navy-500">Model response</label>
          <textarea value={aiDecision} onChange={(e) => setAiDecision(e.target.value)} placeholder="What the agent said or did" rows={3} className={cn(inputClass, 'resize-none')} />
        </div>
        <div>
          <label className="cx-meta mb-1 block font-semibold text-navy-500">Agent reasoning (if available)</label>
          <textarea value={aiOutcome} onChange={(e) => setAiOutcome(e.target.value)} placeholder="Chain of thought, plan, or internal notes the agent produced" rows={3} className={cn(inputClass, 'resize-none')} />
        </div>
      </div>

      <div>
        <label className="cx-meta mb-1 block font-semibold text-navy-500">Tool calls executed (JSON array, optional)</label>
        <textarea
          value={toolCallsJson}
          onChange={(e) => setToolCallsJson(e.target.value)}
          placeholder='[{"function":"transfer_funds","args":{"amount":500,"to":"acct_9"},"authorized":false}]'
          rows={3}
          className={cn(inputClass, 'resize-none font-mono text-xs')}
        />
      </div>

      <label className="flex cursor-pointer items-center gap-2">
        <input type="checkbox" checked={dualSolve} onChange={(e) => setDualSolve(e.target.checked)} className="rounded border-border" />
        <span className="cx-body text-navy-700">Require two independent testers (dual-solve)</span>
      </label>

      {error && <p className="cx-body text-destructive">{error}</p>}

      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={submitting || !clientName || !externalRef || !content}
          className="rounded-lg bg-accent px-5 py-2 cx-body font-semibold text-white hover:bg-accent/90 disabled:opacity-50 cx-fade"
        >
          {submitting ? 'Submitting...' : 'Submit scenario'}
        </button>
      </div>
    </div>
  )
}

function ScenarioCard({ c }: { c: BuyerCase }) {
  const [expanded, setExpanded] = useState(false)
  const trace = (c.traceData ?? {}) as Record<string, unknown>
  const isRetest = typeof trace.retestOf === 'string'
  const toolCalls = Array.isArray(trace.toolCalls) ? (trace.toolCalls as unknown[]) : []

  return (
    <div className="cx-card overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-3 p-4 text-left hover:bg-navy-50/50 cx-fade"
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="cx-body font-semibold text-navy-900">{c.clientName}</span>
            <span className="cx-mono-meta text-navy-400">{c.externalRef}</span>
            {isRetest && (
              <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 text-[11px] font-semibold text-accent">
                <RotateCcw className="size-3" /> Retest
              </span>
            )}
            <span className={cn('cx-meta inline-flex rounded-full px-2 py-0.5 font-semibold', SCENARIO_STATUS_TONE[c.status] ?? 'bg-navy-100 text-navy-500')}>
              {SCENARIO_STATUS_LABEL[c.status] ?? c.status}
            </span>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-3">
            {typeof trace.attackType === 'string' && <span className="cx-meta text-navy-500">{trace.attackType}</span>}
            {typeof trace.targetEndpoint === 'string' && <span className="cx-mono-meta text-navy-400">{trace.targetEndpoint}</span>}
            {typeof trace.domain === 'string' && <span className="cx-meta text-navy-400">{trace.domain}</span>}
            {typeof trace.language === 'string' && <span className="cx-meta text-navy-400">{trace.language}</span>}
            <span className="cx-meta text-navy-400">{new Date(c.createdAt).toLocaleDateString()}</span>
            {c.requiresDualSolve && (
              <span className="cx-meta rounded-full bg-accent/10 px-1.5 py-0.5 font-semibold text-accent">dual-solve</span>
            )}
          </div>
        </div>
        {expanded ? <ChevronUp className="size-4 shrink-0 text-navy-400" /> : <ChevronDown className="size-4 shrink-0 text-navy-400" />}
      </button>

      {expanded && (
        <div className="space-y-3 border-t border-border p-4">
          <div>
            <p className="cx-meta mb-1 font-semibold text-navy-500">Attack prompt</p>
            <div className="rounded-lg bg-navy-50 p-3">
              <p className="cx-body whitespace-pre-wrap text-sm text-navy-800">{c.content}</p>
            </div>
          </div>

          {typeof trace.aiDecision === 'string' && (
            <div>
              <p className="cx-meta font-semibold text-navy-500">Model response</p>
              <p className="cx-body mt-0.5 whitespace-pre-wrap text-navy-700">{trace.aiDecision}</p>
            </div>
          )}

          {toolCalls.length > 0 && (
            <p className="cx-meta text-navy-500">
              {toolCalls.length} tool call{toolCalls.length === 1 ? '' : 's'} executed. Open the full details to inspect them.
            </p>
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

  return (
    <div className="mt-6 space-y-4">
      {/* Scenarios are authored by the Oreset Red Team. The client form stays
          wired (SHOW_SUBMIT_FORM) for engagements that explicitly want it. */}
      {SHOW_SUBMIT_FORM ? (
        <SubmitScenarioForm onSubmitted={(c) => setCases((prev) => [c, ...prev])} />
      ) : (
        <div className="cx-card flex items-start gap-3 p-4">
          <Crosshair className="mt-0.5 size-4 shrink-0 text-accent" />
          <p className="cx-meta text-navy-600">
            Scenarios are authored and run by the Oreset Red Team. Want a specific interaction tested?
            Tell your engagement lead and it will appear here.
          </p>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => handleFilterChange(f)}
            className={cn(
              'cx-meta rounded-full px-3 py-1 font-semibold cx-fade',
              filter === f ? 'bg-accent text-white' : 'bg-navy-100 text-navy-500 hover:bg-navy-200',
            )}
          >
            {f === 'all' ? 'All' : SCENARIO_STATUS_LABEL[f] ?? f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="cx-card p-8 text-center">
          <p className="cx-body text-navy-400">Loading...</p>
        </div>
      ) : cases.length === 0 ? (
        <div className="cx-card flex flex-col items-center gap-3 p-10 text-center">
          <Crosshair className="size-8 text-navy-300" />
          <p className="cx-body text-navy-500">No scenarios yet. They appear here as the red team starts your engagement.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {cases.map((c) => (
            <ScenarioCard key={c.id} c={c} />
          ))}
        </div>
      )}
    </div>
  )
}
