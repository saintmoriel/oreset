'use client'

import { useMemo, useState } from 'react'
import { ChevronDown, ChevronUp, Inbox, Loader2, Mail } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ApiError } from '@/lib/api/client'
import { StatusTag } from '@/components/capture/status-tag'
import { toast } from '@/components/ui/toast'
import { listLeads, updateLead } from '@/lib/api/endpoints/leads'
import type { Lead, LeadStatus } from '@/lib/api/endpoints/leads'

const STATUSES: { key: LeadStatus | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'new', label: 'New' },
  { key: 'contacted', label: 'Contacted' },
  { key: 'qualified', label: 'Qualified' },
  { key: 'closed', label: 'Closed' },
]

const TONE: Record<LeadStatus, 'warning' | 'neutral' | 'success' | 'destructive'> = {
  new: 'warning',
  contacted: 'neutral',
  qualified: 'success',
  closed: 'neutral',
}

function LeadCard({ lead, onChanged }: { lead: Lead; onChanged: () => Promise<void> }) {
  const [open, setOpen] = useState(lead.status === 'new')
  const [notes, setNotes] = useState(lead.notes ?? '')
  const [busy, setBusy] = useState(false)

  async function setStatus(status: LeadStatus) {
    setBusy(true)
    try {
      await updateLead(lead.id, { status })
      toast.success(`Marked ${status}`, `${lead.name}, ${lead.email}`)
      await onChanged()
    } catch (err) {
      toast.error('Could not update lead', err instanceof ApiError ? err.message : undefined)
    }
    setBusy(false)
  }

  async function saveNotes() {
    setBusy(true)
    try {
      await updateLead(lead.id, { notes })
      toast.success('Notes saved')
      await onChanged()
    } catch (err) {
      toast.error('Could not save notes', err instanceof ApiError ? err.message : undefined)
    }
    setBusy(false)
  }

  const mailto = `mailto:${lead.email}?subject=${encodeURIComponent('Re: your Oreset request')}`

  return (
    <div className={cn('cx-card overflow-hidden', lead.status === 'new' && 'border-warning/30')}>
      <button type="button" onClick={() => setOpen((o) => !o)} className="flex w-full items-start justify-between gap-4 p-4 text-left hover:bg-navy-50/40">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="cx-body font-semibold text-navy-900">{lead.name}</span>
            {lead.organization && <span className="cx-meta text-navy-500">{lead.organization}</span>}
            <span className="rounded bg-navy-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-navy-500">
              {lead.kind === 'pilot' ? 'Early access' : 'Contact'}
            </span>
            <StatusTag tone={TONE[lead.status]}>{lead.status}</StatusTag>
          </div>
          <p className="cx-mono-meta mt-1 text-navy-400">
            {lead.email} · {new Date(lead.createdAt).toLocaleString()}
            {lead.agentType ? ` · ${lead.agentType}` : ''}{lead.audience ? ` · ${lead.audience}` : ''}
          </p>
          {!open && <p className="cx-meta mt-1 line-clamp-1 text-navy-600">{lead.message}</p>}
        </div>
        {open ? <ChevronUp className="size-4 shrink-0 text-navy-400" /> : <ChevronDown className="size-4 shrink-0 text-navy-400" />}
      </button>

      {open && (
        <div className="space-y-4 border-t border-border p-4">
          <div className="rounded-lg bg-navy-50 p-3">
            <p className="cx-body whitespace-pre-wrap text-navy-800">{lead.message}</p>
            {lead.languages && <p className="cx-meta mt-2 text-navy-500">Languages: {lead.languages}</p>}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <a href={mailto} className="inline-flex items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 cx-meta font-semibold text-white hover:bg-accent/90">
              <Mail className="size-3.5" /> Reply by email
            </a>
            {(['contacted', 'qualified', 'closed'] as LeadStatus[]).filter((s) => s !== lead.status).map((s) => (
              <button key={s} type="button" disabled={busy} onClick={() => setStatus(s)} className="rounded-md border border-border px-3 py-1.5 cx-meta font-semibold capitalize text-navy-700 hover:bg-navy-50 disabled:opacity-50">
                Mark {s}
              </button>
            ))}
            {busy && <Loader2 className="size-4 animate-spin text-navy-400" />}
          </div>

          <div>
            <label className="cx-meta mb-1 block font-medium text-navy-500">Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="cx-body w-full rounded-lg border border-border bg-card px-3 py-2 text-navy-800 focus:border-accent/50 focus:outline-none" placeholder="What was said, what they need, next step." />
            {notes !== (lead.notes ?? '') && (
              <button type="button" disabled={busy} onClick={saveNotes} className="mt-2 rounded-md border border-border px-3 py-1.5 cx-meta font-semibold text-navy-700 hover:bg-navy-50 disabled:opacity-50">Save notes</button>
            )}
          </div>

          {lead.handledAt && <p className="cx-meta text-navy-400">Last handled {new Date(lead.handledAt).toLocaleString()}</p>}
        </div>
      )}
    </div>
  )
}

export function LeadsInbox({ initialLeads }: { initialLeads: Lead[] }) {
  const [leads, setLeads] = useState(initialLeads)
  const [filter, setFilter] = useState<LeadStatus | 'all'>('new')

  async function refresh() {
    const res = await listLeads()
    setLeads(res.leads)
  }

  const visible = useMemo(() => leads.filter((l) => filter === 'all' || l.status === filter), [leads, filter])
  const counts = Object.fromEntries(STATUSES.map((s) => [s.key, s.key === 'all' ? leads.length : leads.filter((l) => l.status === s.key).length])) as Record<string, number>

  return (
    <div className="mt-6 space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {STATUSES.map((s) => (
          <button key={s.key} type="button" onClick={() => setFilter(s.key)} className={cn('cx-meta rounded-full px-3 py-1 font-semibold cx-fade', filter === s.key ? 'bg-accent text-white' : 'bg-navy-100 text-navy-500 hover:bg-navy-200')}>
            {s.label} <span className="ml-1 tabular-nums opacity-70">{counts[s.key]}</span>
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="cx-card flex flex-col items-center gap-3 p-10 text-center">
          <Inbox className="size-8 text-navy-300" />
          <p className="cx-body text-navy-500">{leads.length === 0 ? 'No leads yet. Both site forms post here.' : 'Nothing in this state.'}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {visible.map((l) => <LeadCard key={l.id} lead={l} onChanged={refresh} />)}
        </div>
      )}
    </div>
  )
}
