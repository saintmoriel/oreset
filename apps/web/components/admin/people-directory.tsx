'use client'

import { useMemo, useState } from 'react'
import { ChevronDown, ChevronUp, KeyRound, Loader2, ShieldCheck, UserPlus, UserX, UserCheck, Copy } from 'lucide-react'
import { STAFF_ROLES } from '@oreset/shared'
import type { StaffRole } from '@oreset/shared'
import { cn } from '@/lib/utils'
import { ApiError } from '@/lib/api/client'
import { StatusTag } from '@/components/capture/status-tag'
import { listPeople, createStaff, updateUser, resetUserPassword } from '@/lib/api/endpoints/people'
import type { Person, RoleAccess } from '@/lib/api/endpoints/people'

const STAFF_ROLE_LABEL: Record<StaffRole, string> = {
  admin: 'Admin',
  reviewer_lead: 'Lead auditor',
  compliance: 'Compliance',
  qa_reviewer: 'QA reviewer (legacy)',
}

type Group = 'all' | 'staff' | 'operator' | 'buyer'
const GROUPS: { key: Group; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'staff', label: 'Staff' },
  { key: 'operator', label: 'Red team' },
  { key: 'buyer', label: 'Clients' },
]

function relative(iso: string | null) {
  if (!iso) return 'never'
  const d = Date.now() - new Date(iso).getTime()
  const days = Math.floor(d / 86_400_000)
  if (days === 0) return 'today'
  if (days === 1) return 'yesterday'
  if (days < 30) return `${days} days ago`
  return new Date(iso).toLocaleDateString()
}

function SecretOnce({ label, value, onDone }: { label: string; value: string; onDone: () => void }) {
  const [copied, setCopied] = useState(false)
  return (
    <div className="rounded-lg border border-warning/40 bg-warning/5 p-4">
      <p className="cx-meta font-semibold text-warning">{label}</p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <code className="rounded bg-card px-3 py-1.5 font-mono text-sm text-navy-900">{value}</code>
        <button
          type="button"
          onClick={() => { void navigator.clipboard.writeText(value); setCopied(true) }}
          className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 cx-meta font-semibold text-navy-700 hover:bg-navy-50"
        >
          <Copy className="size-3.5" /> {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <p className="cx-meta mt-2 text-navy-600">
        Shown once. Share it over a channel you trust and ask them to change it at first sign-in.
      </p>
      <button type="button" onClick={onDone} className="cx-meta mt-2 font-semibold text-navy-500 hover:text-navy-800">
        Done, hide it
      </button>
    </div>
  )
}

function CreateStaffForm({ onCreated }: { onCreated: () => Promise<void> }) {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [staffRole, setStaffRole] = useState<StaffRole>('reviewer_lead')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [secret, setSecret] = useState<{ email: string; password: string } | null>(null)

  async function submit() {
    setSubmitting(true)
    setError(null)
    try {
      const res = await createStaff({ email, displayName, staffRole })
      setSecret({ email, password: res.temporaryPassword })
      setEmail(''); setDisplayName('')
      await onCreated()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not create the account.')
    }
    setSubmitting(false)
  }

  if (secret) {
    return <SecretOnce label={`Temporary password for ${secret.email}`} value={secret.password} onDone={() => { setSecret(null); setOpen(false) }} />
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="cx-card flex w-full items-center justify-center gap-2 p-4 text-accent hover:bg-accent/5 cx-fade">
        <UserPlus className="size-4" />
        <span className="cx-body font-semibold">Add a staff account</span>
      </button>
    )
  }

  const input = 'cx-body w-full rounded-lg border border-border bg-card px-3 py-2 text-navy-800 focus:border-accent/50 focus:outline-none'
  return (
    <div className="cx-card space-y-3 p-5">
      <div className="flex items-center justify-between">
        <p className="cx-body font-semibold text-navy-900">New staff account</p>
        <button type="button" onClick={() => setOpen(false)} className="cx-meta text-navy-400 hover:text-navy-600">Cancel</button>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Full name" className={input} />
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="work@email.com" type="email" className={input} />
        <select value={staffRole} onChange={(e) => setStaffRole(e.target.value as StaffRole)} className={input}>
          {STAFF_ROLES.filter((r) => r !== 'qa_reviewer').map((r) => <option key={r} value={r}>{STAFF_ROLE_LABEL[r]}</option>)}
        </select>
      </div>
      <p className="cx-meta text-navy-500">A temporary password is generated and shown to you once. Testers and clients are not created here: testers apply, clients are provisioned on the Clients page.</p>
      {error && <p className="cx-body text-destructive">{error}</p>}
      <div className="flex justify-end">
        <button type="button" onClick={submit} disabled={submitting || !email || !displayName} className="inline-flex h-10 items-center gap-2 rounded-lg bg-accent px-5 cx-body font-semibold text-white hover:bg-accent/90 disabled:opacity-50">
          {submitting && <Loader2 className="size-4 animate-spin" />} Create account
        </button>
      </div>
    </div>
  )
}

function PersonRow({ p, roles, isSelf, onChanged }: { p: Person; roles: RoleAccess; isSelf: boolean; onChanged: () => Promise<void> }) {
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [secret, setSecret] = useState<string | null>(null)
  const access = roles[p.accessKey]

  async function run(label: string, fn: () => Promise<unknown>) {
    setBusy(label); setError(null)
    try { await fn(); await onChanged() } catch (err) { setError(err instanceof ApiError ? err.message : 'Action failed.') }
    setBusy(null)
  }

  return (
    <div className={cn('cx-card overflow-hidden', p.status === 'suspended' && 'opacity-70')}>
      <button type="button" onClick={() => setOpen((o) => !o)} className="grid w-full grid-cols-[1.4fr_1fr_1fr_auto] items-center gap-3 p-4 text-left hover:bg-navy-50/40 sm:grid-cols-[1.6fr_1fr_1fr_1fr_auto]">
        <div className="min-w-0">
          <p className="cx-body truncate font-semibold text-navy-900">
            {p.displayName ?? p.email ?? p.phone ?? 'Unnamed'}{isSelf && <span className="ml-2 cx-meta font-normal text-navy-400">(you)</span>}
          </p>
          <p className="cx-mono-meta truncate text-navy-400">{p.email ?? p.phone ?? p.id.slice(0, 8)}{p.operatorCode ? ` · ${p.operatorCode}` : ''}</p>
        </div>
        <div><span className="rounded bg-navy-100 px-2 py-0.5 text-[11px] font-semibold text-navy-700">{p.accessLabel}</span></div>
        <div>
          {p.status === 'active' && <StatusTag tone="success">Active</StatusTag>}
          {p.status === 'pending' && <StatusTag tone="warning">Pending</StatusTag>}
          {p.status === 'suspended' && <StatusTag tone="destructive">Suspended</StatusTag>}
        </div>
        <div className="hidden sm:block"><p className="cx-meta text-navy-500">Last sign-in {relative(p.lastLoginAt)}</p></div>
        {open ? <ChevronUp className="size-4 text-navy-400" /> : <ChevronDown className="size-4 text-navy-400" />}
      </button>

      {open && (
        <div className="grid gap-4 border-t border-border p-4 lg:grid-cols-2">
          <div className="space-y-3">
            <div>
              <p className="cx-meta font-semibold text-navy-500">Can reach</p>
              <p className="cx-mono-meta text-navy-400">{access?.portal}</p>
              <ul className="mt-1 space-y-0.5">
                {(access?.reaches ?? []).map((r) => <li key={r} className="cx-meta flex items-center gap-1.5 text-navy-700"><ShieldCheck className="size-3 text-accent" />{r}</li>)}
              </ul>
            </div>
            {p.role === 'operator' && (
              <div className="grid grid-cols-2 gap-3">
                <div><p className="cx-meta text-navy-400">Agreements signed</p><p className="cx-body text-navy-800">{p.agreementsSigned} of 3</p></div>
                <div><p className="cx-meta text-navy-400">Identity</p><p className="cx-body capitalize text-navy-800">{p.verification}</p></div>
                {p.location && <div><p className="cx-meta text-navy-400">Location</p><p className="cx-body text-navy-800">{p.location}</p></div>}
                {p.languages.length > 0 && <div><p className="cx-meta text-navy-400">Languages</p><p className="cx-body text-navy-800">{p.languages.join(', ')}</p></div>}
              </div>
            )}
            <p className="cx-meta text-navy-400">Account created {new Date(p.createdAt).toLocaleDateString()}</p>
          </div>

          <div className="space-y-3">
            <p className="cx-meta font-semibold text-navy-500">Controls</p>
            {p.role === 'staff' && (
              <label className="block">
                <span className="cx-meta text-navy-400">Staff role</span>
                <select
                  value={p.staffRole ?? ''}
                  disabled={busy !== null || isSelf}
                  onChange={(e) => run('role', () => updateUser(p.id, { staffRole: e.target.value as StaffRole }))}
                  className="cx-body mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-navy-800 disabled:opacity-60"
                >
                  {STAFF_ROLES.map((r) => <option key={r} value={r}>{STAFF_ROLE_LABEL[r]}</option>)}
                </select>
                {isSelf && <span className="cx-meta text-navy-400">You cannot change your own role.</span>}
              </label>
            )}
            <div className="flex flex-wrap gap-2">
              {p.status === 'suspended' ? (
                <button type="button" disabled={busy !== null} onClick={() => run('status', () => updateUser(p.id, { status: 'active' }))} className="inline-flex items-center gap-1.5 rounded-md border border-success/50 px-3 py-1.5 cx-meta font-semibold text-success hover:bg-success/5 disabled:opacity-50">
                  <UserCheck className="size-3.5" /> Reactivate
                </button>
              ) : (
                <button type="button" disabled={busy !== null || isSelf} onClick={() => run('status', () => updateUser(p.id, { status: 'suspended' }))} className="inline-flex items-center gap-1.5 rounded-md border border-destructive/40 px-3 py-1.5 cx-meta font-semibold text-destructive hover:bg-destructive/5 disabled:opacity-50">
                  <UserX className="size-3.5" /> Suspend, sign out everywhere
                </button>
              )}
              {p.email && (
                <button type="button" disabled={busy !== null} onClick={() => run('reset', async () => { const r = await resetUserPassword(p.id); setSecret(r.temporaryPassword) })} className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 cx-meta font-semibold text-navy-700 hover:bg-navy-50 disabled:opacity-50">
                  <KeyRound className="size-3.5" /> Force password reset
                </button>
              )}
              {busy && <Loader2 className="size-4 animate-spin text-navy-400" />}
            </div>
            {secret && <SecretOnce label={`Temporary password for ${p.email}`} value={secret} onDone={() => setSecret(null)} />}
            {error && <p className="cx-body text-destructive">{error}</p>}
          </div>
        </div>
      )}
    </div>
  )
}

export function PeopleDirectory({ initialUsers, roles, currentUserId }: { initialUsers: Person[]; roles: RoleAccess; currentUserId: string }) {
  const [users, setUsers] = useState(initialUsers)
  const [group, setGroup] = useState<Group>('all')
  const [search, setSearch] = useState('')

  async function refresh() {
    const res = await listPeople()
    setUsers(res.users)
  }

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase()
    return users
      .filter((u) => u.role !== 'contributor')
      .filter((u) => group === 'all' || u.role === group)
      .filter((u) => !q || [u.displayName, u.email, u.operatorCode, u.accessLabel].some((v) => v?.toLowerCase().includes(q)))
  }, [users, group, search])

  const counts = {
    staff: users.filter((u) => u.role === 'staff').length,
    operator: users.filter((u) => u.role === 'operator').length,
    buyer: users.filter((u) => u.role === 'buyer').length,
  }

  return (
    <div className="mt-6 space-y-4">
      <div className="cx-card grid grid-cols-3 divide-x divide-border">
        <div className="p-4"><p className="cx-meta text-navy-400">Staff</p><p className="cx-stat text-navy-900">{counts.staff}</p></div>
        <div className="p-4"><p className="cx-meta text-navy-400">Red team testers</p><p className="cx-stat text-navy-900">{counts.operator}</p></div>
        <div className="p-4"><p className="cx-meta text-navy-400">Client accounts</p><p className="cx-stat text-navy-900">{counts.buyer}</p></div>
      </div>

      <CreateStaffForm onCreated={refresh} />

      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex rounded-lg bg-navy-100/60 p-1">
          {GROUPS.map((g) => (
            <button key={g.key} type="button" onClick={() => setGroup(g.key)} className={cn('cx-meta rounded-md px-3 py-1.5 font-medium cx-fade', group === g.key ? 'bg-card text-navy-900 shadow-xs' : 'text-navy-500 hover:text-navy-800')}>
              {g.label}
            </button>
          ))}
        </div>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, email, code" className="h-9 rounded-lg border border-border bg-card px-3 cx-meta text-navy-800 focus:border-accent/50 focus:outline-none" />
        <span className="cx-meta text-navy-400">{visible.length} account{visible.length === 1 ? '' : 's'}</span>
      </div>

      <div className="space-y-2">
        {visible.map((p) => <PersonRow key={p.id} p={p} roles={roles} isSelf={p.id === currentUserId} onChanged={refresh} />)}
      </div>
    </div>
  )
}
