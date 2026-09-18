'use client'

import { useState } from 'react'
import { Check, Loader2, UserX } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ApiError } from '@/lib/api/client'
import { StatusTag } from '@/components/capture/status-tag'
import { toast } from '@/components/ui/toast'
import { approveApplication, rejectApplication, listOperatorApplications } from '@/lib/api/endpoints/operators'
import type { OperatorApplication } from '@/lib/api/endpoints/operators'

function ApplicationRow({ a, onChanged }: { a: OperatorApplication; onChanged: () => Promise<void> }) {
  const [busy, setBusy] = useState(false)
  const [rejecting, setRejecting] = useState(false)
  const [reason, setReason] = useState('')
  const pending = a.user.status === 'pending'

  async function approve() {
    setBusy(true)
    try {
      await approveApplication(a.user.id)
      toast.success('Approved', `${a.user.displayName ?? a.user.email} can now sign in, sign agreements, and calibrate.`)
      await onChanged()
    } catch (err) {
      toast.error('Could not approve', err instanceof ApiError ? err.message : undefined)
    }
    setBusy(false)
  }

  async function reject() {
    setBusy(true)
    try {
      await rejectApplication(a.user.id, reason.trim() || undefined)
      toast.success('Rejected', `${a.user.displayName ?? a.user.email} has been told by email.`)
      await onChanged()
    } catch (err) {
      toast.error('Could not reject', err instanceof ApiError ? err.message : undefined)
    }
    setBusy(false)
  }

  return (
    <div className={cn('p-4', pending && 'bg-warning/[0.03]')}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="cx-body font-medium text-navy-900">{a.user.displayName ?? a.user.email}</p>
          <p className="cx-mono-meta mt-0.5 text-navy-400">
            {a.user.operatorCode} · {a.user.email} · {a.location} · applied {new Date(a.createdAt).toLocaleDateString()}
          </p>
          <p className="cx-meta mt-1 text-navy-500">
            {a.languages.map((l) => `${l.language} (${l.fluency})`).join(', ')}
            {a.academicBackground ? ` · ${a.academicBackground}` : ''}
          </p>
          {a.experience && <p className="cx-meta mt-2 whitespace-pre-wrap text-navy-700">{a.experience}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {a.user.status === 'active' && <StatusTag tone="success">Approved</StatusTag>}
          {a.user.status === 'suspended' && <StatusTag tone="destructive">Rejected</StatusTag>}
          {pending && !rejecting && (
            <>
              <StatusTag tone="warning">Pending</StatusTag>
              <button type="button" disabled={busy} onClick={approve} className="inline-flex items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 cx-meta font-semibold text-white hover:bg-accent/90 disabled:opacity-50">
                {busy ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />} Approve
              </button>
              <button type="button" disabled={busy} onClick={() => setRejecting(true)} className="inline-flex items-center gap-1.5 rounded-md border border-destructive/40 px-3 py-1.5 cx-meta font-semibold text-destructive hover:bg-destructive/5 disabled:opacity-50">
                <UserX className="size-3.5" /> Reject
              </button>
            </>
          )}
        </div>
      </div>
      {pending && rejecting && (
        <div className="mt-3 flex flex-wrap items-end gap-2">
          <div className="min-w-[16rem] flex-1">
            <label className="cx-meta mb-1 block font-medium text-navy-500">Reason (sent to the applicant, optional)</label>
            <input value={reason} onChange={(e) => setReason(e.target.value)} className="cx-body w-full rounded-lg border border-border bg-card px-3 py-2 text-navy-800 focus:border-accent/50 focus:outline-none" placeholder="e.g. We need more application security experience for this cohort." />
          </div>
          <button type="button" disabled={busy} onClick={reject} className="inline-flex items-center gap-1.5 rounded-md bg-destructive px-3 py-2 cx-meta font-semibold text-white hover:bg-destructive/90 disabled:opacity-50">
            {busy ? <Loader2 className="size-3.5 animate-spin" /> : <UserX className="size-3.5" />} Confirm reject
          </button>
          <button type="button" onClick={() => setRejecting(false)} className="rounded-md border border-border px-3 py-2 cx-meta font-semibold text-navy-600 hover:bg-navy-50">Cancel</button>
        </div>
      )}
    </div>
  )
}

export function ApplicationsList({ initial }: { initial: OperatorApplication[] }) {
  const [applications, setApplications] = useState(initial)
  async function refresh() {
    const res = await listOperatorApplications()
    setApplications(res.applications)
  }
  const pending = applications.filter((a) => a.user.status === 'pending')
  const decided = applications.filter((a) => a.user.status !== 'pending')

  return (
    <div className="mt-6 space-y-6">
      <div>
        <p className="cx-label text-navy-400">Awaiting a decision ({pending.length})</p>
        {pending.length === 0 ? (
          <p className="cx-body mt-2.5 text-navy-400">No applications waiting.</p>
        ) : (
          <div className="cx-card mt-2.5 divide-y divide-border">
            {pending.map((a) => <ApplicationRow key={a.id} a={a} onChanged={refresh} />)}
          </div>
        )}
      </div>
      {decided.length > 0 && (
        <div>
          <p className="cx-label text-navy-400">Decided ({decided.length})</p>
          <div className="cx-card mt-2.5 divide-y divide-border">
            {decided.map((a) => <ApplicationRow key={a.id} a={a} onChanged={refresh} />)}
          </div>
        </div>
      )}
    </div>
  )
}
