'use client'

import { useState } from 'react'
import { Building2, Loader2, Copy } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ApiError } from '@/lib/api/client'
import { toast } from '@/components/ui/toast'
import { StatusTag } from '@/components/capture/status-tag'
import { listClients, provisionClient, formatMoney } from '@/lib/api/endpoints/people'
import { EngagementsPanel } from '@/components/admin/engagements-panel'
import type { Client } from '@/lib/api/endpoints/people'

function scoreTone(score: number) {
  if (score >= 90) return 'text-success'
  if (score >= 70) return 'text-warning'
  return 'text-destructive'
}

function generatePassword() {
  const bytes = new Uint8Array(9)
  crypto.getRandomValues(bytes)
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function ProvisionForm({ onCreated }: { onCreated: () => Promise<void> }) {
  const [open, setOpen] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [secret, setSecret] = useState<{ email: string; password: string } | null>(null)
  const [copied, setCopied] = useState(false)

  async function submit() {
    setSubmitting(true)
    setError(null)
    const password = generatePassword()
    try {
      await provisionClient({ email, displayName, password })
      setSecret({ email, password })
      toast.success('Client provisioned', `${displayName} can sign in at /buyer.`)
      setDisplayName(''); setEmail('')
      await onCreated()
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Could not provision the client.'
      setError(message)
      toast.error('Client not provisioned', message)
    }
    setSubmitting(false)
  }

  if (secret) {
    return (
      <div className="rounded-lg border border-warning/40 bg-warning/5 p-4">
        <p className="cx-meta font-semibold text-warning">Client account created for {secret.email}</p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <code className="rounded bg-card px-3 py-1.5 font-mono text-sm text-navy-900">{secret.password}</code>
          <button type="button" onClick={() => { void navigator.clipboard.writeText(secret.password); setCopied(true) }} className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 cx-meta font-semibold text-navy-700 hover:bg-navy-50">
            <Copy className="size-3.5" /> {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
        <p className="cx-meta mt-2 text-navy-600">Temporary password, shown once. Send it over a channel you trust. They sign in at /buyer.</p>
        <button type="button" onClick={() => { setSecret(null); setOpen(false); setCopied(false) }} className="cx-meta mt-2 font-semibold text-navy-500 hover:text-navy-800">Done, hide it</button>
      </div>
    )
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="cx-card flex w-full items-center justify-center gap-2 p-4 text-accent hover:bg-accent/5 cx-fade">
        <Building2 className="size-4" />
        <span className="cx-body font-semibold">Provision a client</span>
      </button>
    )
  }

  const input = 'cx-body w-full rounded-lg border border-border bg-card px-3 py-2 text-navy-800 focus:border-accent/50 focus:outline-none'
  return (
    <div className="cx-card space-y-3 p-5">
      <div className="flex items-center justify-between">
        <p className="cx-body font-semibold text-navy-900">New client</p>
        <button type="button" onClick={() => setOpen(false)} className="cx-meta text-navy-400 hover:text-navy-600">Cancel</button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Organisation name" className={input} />
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Contact email (their login)" type="email" className={input} />
      </div>
      {error && <p className="cx-body text-destructive">{error}</p>}
      <div className="flex justify-end">
        <button type="button" onClick={submit} disabled={submitting || !email || !displayName} className="inline-flex h-10 items-center gap-2 rounded-lg bg-accent px-5 cx-body font-semibold text-white hover:bg-accent/90 disabled:opacity-50">
          {submitting && <Loader2 className="size-4 animate-spin" />} Create client account
        </button>
      </div>
    </div>
  )
}

export function ClientsDirectory({ initialClients }: { initialClients: Client[] }) {
  const [clients, setClients] = useState(initialClients)

  async function refresh() {
    const res = await listClients()
    setClients(res.clients)
  }

  const totals = clients.reduce(
    (t, c) => ({ open: t.open + c.findingsOpen, running: t.running + (c.scenariosInProgress > 0 ? 1 : 0) }),
    { open: 0, running: 0 },
  )

  return (
    <div className="mt-6 space-y-4">
      <div className="cx-card grid grid-cols-3 divide-x divide-border">
        <div className="p-4"><p className="cx-meta text-navy-400">Clients</p><p className="cx-stat text-navy-900">{clients.length}</p></div>
        <div className="p-4"><p className="cx-meta text-navy-400">Engagements running</p><p className="cx-stat text-navy-900">{totals.running}</p></div>
        <div className="p-4"><p className="cx-meta text-navy-400">Open findings, all clients</p><p className="cx-stat text-navy-900">{totals.open}</p></div>
      </div>

      <ProvisionForm onCreated={refresh} />

      {clients.length === 0 ? (
        <div className="cx-card flex flex-col items-center gap-3 p-10 text-center">
          <Building2 className="size-8 text-navy-300" />
          <p className="cx-body text-navy-500">No clients yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {clients.map((c) => (
            <div key={c.id} className={cn('cx-card p-4', c.status === 'suspended' && 'opacity-70')}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="cx-body font-semibold text-navy-900">{c.displayName ?? c.email}</p>
                    {c.agentName && <span className="cx-meta text-navy-500">{c.agentName}</span>}
                    {c.status === 'suspended' && <StatusTag tone="destructive">Suspended</StatusTag>}
                    {c.scenariosInProgress > 0 && <StatusTag tone="warning">Engagement running</StatusTag>}
                  </div>
                  <p className="cx-mono-meta mt-0.5 text-navy-400">
                    {c.email} · client since {new Date(c.createdAt).toLocaleDateString()} · last sign-in {c.lastLoginAt ? new Date(c.lastLoginAt).toLocaleDateString() : 'never'}
                  </p>
                </div>
                <div className="text-right">
                  <p className={cn('font-mono text-2xl font-semibold tabular-nums', scoreTone(c.resilienceScore))}>{c.resilienceScore}</p>
                  <p className="cx-meta text-navy-400">{c.resilienceLabel}</p>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-5">
                <div><p className="cx-meta text-navy-400">Scenarios</p><p className="cx-body font-semibold text-navy-900">{c.scenariosTotal}<span className="cx-meta font-normal text-navy-400"> ({c.scenariosInProgress} in progress)</span></p></div>
                <div><p className="cx-meta text-navy-400">Open findings</p><p className="cx-body font-semibold text-navy-900">{c.findingsOpen}</p></div>
                <div><p className="cx-meta text-navy-400">In retest</p><p className="cx-body font-semibold text-navy-900">{c.findingsInRetest}</p></div>
                <div><p className="cx-meta text-navy-400">Closed</p><p className="cx-body font-semibold text-navy-900">{c.findingsClosed}</p></div>
                <div>
                  <p className="cx-meta text-navy-400">Paid</p>
                  <p className="cx-body font-semibold text-navy-900">
                    {c.paid.length === 0 ? 'nothing yet' : c.paid.map((p) => formatMoney(p.paidMinorUnits, p.currency)).join(', ')}
                  </p>
                </div>
              </div>
              <EngagementsPanel buyerId={c.id} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
