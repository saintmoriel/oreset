'use client'

import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Check, Lock, LockOpen, X } from 'lucide-react'
import { ADMIN_MODULE_DESCRIPTIONS, STAFF_ROLE_LABELS, type AdminModule } from '@oreset/shared'
import { toast } from '@/components/ui/toast'
import { describeError } from '@/lib/api/client'
import {
  decideAccessRequest,
  getMyAccess,
  getPendingAccess,
  requestModuleAccess,
  revokeGrant,
  type ActiveGrantRow,
  type MyAccess,
  type PendingAccessRequest,
} from '@/lib/api/endpoints/access'

export function AccessCenter() {
  const searchParams = useSearchParams()
  const denied = searchParams.get('denied')

  const [access, setAccess] = useState<MyAccess | null>(null)
  const [pending, setPending] = useState<{ requests: PendingAccessRequest[]; grants: ActiveGrantRow[] } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      const me = await getMyAccess()
      setAccess(me)
      if (me.canApprove) setPending(await getPendingAccess())
    } catch (err) {
      setError(describeError(err, 'Could not load your access.'))
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  if (error) return <p className="cx-body mt-6 text-destructive" role="alert">{error}</p>
  if (!access) return <p className="cx-body mt-6 text-navy-400">Loading your access…</p>

  const heldCount = access.catalogue.filter((c) => c.held).length

  return (
    <div className="mt-6 space-y-8">
      {denied && (
        <div className="rounded-md border border-warning/40 bg-warning/10 px-4 py-3 text-sm text-navy-800" role="alert">
          That page belongs to a module you do not hold yet. Request it below and say why.
        </div>
      )}

      <section>
        <p className="cx-label text-navy-400">
          You are {access.staffRole ? STAFF_ROLE_LABELS[access.staffRole] : 'staff'}. {heldCount} of {access.catalogue.length} modules.
        </p>
        <div className="mt-2.5 grid gap-3 sm:grid-cols-2">
          {access.catalogue.map((entry) => (
            <ModuleCard key={entry.module} entry={entry} onChanged={load} />
          ))}
        </div>
      </section>

      {access.requests.length > 0 && (
        <section>
          <p className="cx-label text-navy-400">Your requests</p>
          <div className="cx-card mt-2.5 divide-y divide-border">
            {access.requests.map((r) => (
              <div key={r.id} className="flex items-start justify-between gap-4 p-4">
                <div className="min-w-0">
                  <p className="cx-body font-medium text-navy-900">{access.catalogue.find((c) => c.module === r.module)?.label ?? r.module}</p>
                  <p className="cx-meta mt-0.5 text-navy-500">{r.reason}</p>
                  {r.decisionNote && <p className="cx-meta mt-0.5 text-navy-400">Note: {r.decisionNote}</p>}
                </div>
                <span
                  className={`cx-meta shrink-0 rounded-full px-2.5 py-0.5 font-medium ${
                    r.status === 'approved' ? 'bg-success/10 text-success' : r.status === 'denied' ? 'bg-destructive/10 text-destructive' : 'bg-warning/10 text-warning'
                  }`}
                >
                  {r.status === 'pending' ? 'Waiting for a decision' : r.status === 'approved' ? 'Approved' : 'Declined'}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {access.canApprove && pending && (
        <>
          <section>
            <p className="cx-label text-navy-400">Requests waiting for your decision</p>
            {pending.requests.length === 0 ? (
              <p className="cx-body mt-2.5 text-navy-400">Nothing waiting.</p>
            ) : (
              <div className="cx-card mt-2.5 divide-y divide-border">
                {pending.requests.map((r) => (
                  <PendingRow key={r.id} request={r} onDecided={load} />
                ))}
              </div>
            )}
          </section>

          <section>
            <p className="cx-label text-navy-400">Extra modules granted to people</p>
            {pending.grants.length === 0 ? (
              <p className="cx-body mt-2.5 text-navy-400">Nobody holds anything beyond their role.</p>
            ) : (
              <div className="cx-card mt-2.5 divide-y divide-border">
                {pending.grants.map((row) => (
                  <div key={row.user.id} className="p-4">
                    <p className="cx-body font-medium text-navy-900">
                      {row.user.displayName ?? row.user.email}
                      <span className="cx-meta ml-2 text-navy-400">{row.user.staffRole ? STAFF_ROLE_LABELS[row.user.staffRole] : ''}</span>
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {row.grants.map((g) => (
                        <GrantChip key={g.id} grant={g} onRevoked={load} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  )
}

function ModuleCard({ entry, onChanged }: { entry: MyAccess['catalogue'][number]; onChanged: () => Promise<void> }) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function submit() {
    setSubmitting(true)
    try {
      await requestModuleAccess(entry.module, reason.trim())
      toast.success('Request sent', `Whoever holds People will see your request for ${entry.label}.`)
      setOpen(false)
      setReason('')
      await onChanged()
    } catch (err) {
      toast.error('Not sent', describeError(err, 'Could not send the request.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={`cx-card p-4 ${entry.held ? '' : 'border-dashed'}`}>
      <div className="flex items-start gap-3">
        <span className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${entry.held ? 'bg-success/10 text-success' : 'bg-navy-100 text-navy-400'}`}>
          {entry.held ? <LockOpen className="size-4" /> : <Lock className="size-4" />}
        </span>
        <div className="min-w-0 flex-1">
          <p className="cx-body font-medium text-navy-900">{entry.label}</p>
          <p className="cx-meta mt-0.5 text-navy-500">{ADMIN_MODULE_DESCRIPTIONS[entry.module as AdminModule]}</p>
          <p className="cx-meta mt-1.5 text-navy-400">
            {entry.held
              ? entry.byRole
                ? 'Part of your role.'
                : entry.grant?.expiresAt
                  ? `Granted until ${new Date(entry.grant.expiresAt).toLocaleDateString()}.`
                  : 'Granted to you.'
              : entry.pendingRequest
                ? 'Requested. Waiting for a decision.'
                : 'Not in your role.'}
          </p>
        </div>
      </div>

      {!entry.held && !entry.pendingRequest && (
        <div className="mt-3">
          {open ? (
            <div className="space-y-2">
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                placeholder="Why do you need this module, and for how long?"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:border-accent"
              />
              <div className="flex gap-2">
                <button
                  onClick={submit}
                  disabled={submitting || reason.trim().length < 10}
                  className="inline-flex h-9 items-center rounded-md bg-accent px-3 text-sm font-semibold text-accent-foreground disabled:opacity-50"
                >
                  {submitting ? 'Sending…' : 'Send request'}
                </button>
                <button onClick={() => setOpen(false)} className="inline-flex h-9 items-center rounded-md border border-border px-3 text-sm text-navy-600">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => setOpen(true)} className="cx-meta font-medium text-accent hover:underline">
              Request access
            </button>
          )}
        </div>
      )}
    </div>
  )
}

function PendingRow({ request, onDecided }: { request: PendingAccessRequest; onDecided: () => Promise<void> }) {
  const [days, setDays] = useState<string>('')
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState<'approved' | 'denied' | null>(null)

  async function decide(decision: 'approved' | 'denied') {
    setBusy(decision)
    try {
      await decideAccessRequest(request.id, {
        decision,
        note: note.trim() || undefined,
        expiresInDays: decision === 'approved' && days ? Number(days) : undefined,
      })
      toast.success(decision === 'approved' ? 'Access granted' : 'Request declined', `${request.user.displayName ?? request.user.email}: ${request.moduleLabel}.`)
      await onDecided()
    } catch (err) {
      toast.error('Could not decide', describeError(err, 'Try again.'))
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="cx-body font-medium text-navy-900">
            {request.user.displayName ?? request.user.email}
            <span className="cx-meta ml-2 text-navy-400">{request.user.staffRole ? STAFF_ROLE_LABELS[request.user.staffRole] : ''}</span>
          </p>
          <p className="cx-meta mt-0.5 text-navy-800">wants <span className="font-medium">{request.moduleLabel}</span></p>
          <p className="cx-meta mt-1 text-navy-500">“{request.reason}”</p>
          <p className="cx-meta mt-1 text-navy-300">{new Date(request.createdAt).toLocaleString()}</p>
        </div>
        <div className="flex flex-col gap-2 sm:items-end">
          <div className="flex gap-2">
            <select value={days} onChange={(e) => setDays(e.target.value)} className="h-9 rounded-md border border-border bg-background px-2 text-sm">
              <option value="">No expiry</option>
              <option value="7">7 days</option>
              <option value="30">30 days</option>
              <option value="90">90 days</option>
            </select>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Note (optional)"
              className="h-9 w-44 rounded-md border border-border bg-background px-2 text-sm"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => decide('approved')}
              disabled={busy !== null}
              className="inline-flex h-9 items-center gap-1.5 rounded-md bg-success px-3 text-sm font-semibold text-white disabled:opacity-50"
            >
              <Check className="size-4" /> Approve
            </button>
            <button
              onClick={() => decide('denied')}
              disabled={busy !== null}
              className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border px-3 text-sm text-navy-700 disabled:opacity-50"
            >
              <X className="size-4" /> Decline
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function GrantChip({ grant, onRevoked }: { grant: ActiveGrantRow['grants'][number]; onRevoked: () => Promise<void> }) {
  const [busy, setBusy] = useState(false)
  async function revoke() {
    if (!confirm(`Remove ${grant.moduleLabel} from this person?`)) return
    setBusy(true)
    try {
      await revokeGrant(grant.id)
      toast.success('Access removed', grant.moduleLabel)
      await onRevoked()
    } catch (err) {
      toast.error('Could not remove', describeError(err, 'Try again.'))
    } finally {
      setBusy(false)
    }
  }
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-border bg-navy-50 px-3 py-1 text-xs text-navy-800" title={grant.reason}>
      {grant.moduleLabel}
      {grant.expiresAt && <span className="text-navy-400">until {new Date(grant.expiresAt).toLocaleDateString()}</span>}
      <button onClick={revoke} disabled={busy} aria-label={`Remove ${grant.moduleLabel}`} className="text-navy-400 hover:text-destructive disabled:opacity-50">
        <X className="size-3.5" />
      </button>
    </span>
  )
}
