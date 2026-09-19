'use client'

import { useEffect, useState } from 'react'
import { ChevronDown, ChevronUp, Plus } from 'lucide-react'
import {
  ENGAGEMENT_PHASES,
  ENGAGEMENT_PHASE_LABELS,
  ENGAGEMENT_TIERS,
  ENGAGEMENT_TIER_LABELS,
  type EngagementPhase,
  type EngagementTier,
} from '@oreset/shared'
import { toast } from '@/components/ui/toast'
import { describeError } from '@/lib/api/client'
import { createEngagement, listEngagements, updateEngagement, type Engagement } from '@/lib/api/endpoints/engagements'

const INPUT = 'w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:border-accent'
const PRIMARY = 'inline-flex h-9 items-center gap-1.5 rounded-md bg-accent px-3 text-sm font-semibold text-accent-foreground hover:bg-copper-600 disabled:opacity-60'
const SECONDARY = 'inline-flex h-9 items-center gap-1.5 rounded-md border border-border px-3 text-sm font-medium text-navy-700 hover:bg-navy-50 disabled:opacity-60'

function toDateInput(iso: string | null) {
  return iso ? iso.slice(0, 10) : ''
}
function fromDateInput(v: string): string | null {
  return v ? new Date(`${v}T00:00:00Z`).toISOString() : null
}

// Engagements for one client, inside the Clients directory card.
export function EngagementsPanel({ buyerId }: { buyerId: string }) {
  const [open, setOpen] = useState(false)
  const [list, setList] = useState<Engagement[] | null>(null)
  const [creating, setCreating] = useState(false)

  async function load() {
    try {
      const res = await listEngagements(buyerId)
      setList(res.engagements)
    } catch (err) {
      toast.error('Could not load engagements', describeError(err, 'Try again.'))
    }
  }

  useEffect(() => {
    if (open && list === null) void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  return (
    <div className="mt-3 border-t border-border pt-3">
      <button onClick={() => setOpen((o) => !o)} className="cx-meta flex items-center gap-1.5 font-medium text-navy-600 hover:text-accent">
        {open ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
        Engagements{list ? ` (${list.length})` : ''}
      </button>

      {open && (
        <div className="mt-3 space-y-3">
          {list === null ? (
            <p className="cx-meta text-navy-400">Loading…</p>
          ) : list.length === 0 && !creating ? (
            <p className="cx-meta text-navy-400">No engagement yet. Create one so scenarios, Rules of Engagement and the client’s phase banner have somewhere to live.</p>
          ) : (
            list.map((e) => <EngagementRow key={e.id} engagement={e} onChanged={load} />)
          )}

          {creating ? (
            <EngagementForm
              buyerId={buyerId}
              onDone={async () => {
                setCreating(false)
                await load()
              }}
              onCancel={() => setCreating(false)}
            />
          ) : (
            <button onClick={() => setCreating(true)} className={SECONDARY}>
              <Plus className="size-4" /> New engagement
            </button>
          )}
        </div>
      )}
    </div>
  )
}

function EngagementRow({ engagement: e, onChanged }: { engagement: Engagement; onChanged: () => Promise<void> }) {
  const [editing, setEditing] = useState(false)
  const [busy, setBusy] = useState(false)

  async function setPhase(phase: EngagementPhase) {
    setBusy(true)
    try {
      await updateEngagement(e.id, { phase })
      toast.success('Phase updated', `${e.name}: ${ENGAGEMENT_PHASE_LABELS[phase]}. The client sees this now.`)
      await onChanged()
    } catch (err) {
      toast.error('Not updated', describeError(err, 'Try again.'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="rounded-md border border-border bg-navy-50/40 p-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="cx-body font-medium text-navy-900">{e.name}</p>
          <p className="cx-meta text-navy-500">
            {ENGAGEMENT_TIER_LABELS[e.tier]} · {e.agentName} · {e.scenarioCount ?? 0} scenarios · rules v{e.rulesVersion}
            {e.rules.trim() ? '' : ' (no rules written yet, testers are not gated)'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="cx-meta text-navy-500">Phase</label>
          <select value={e.phase} disabled={busy} onChange={(ev) => setPhase(ev.target.value as EngagementPhase)} className="h-8 rounded-md border border-border bg-background px-2 text-sm">
            {ENGAGEMENT_PHASES.map((p) => <option key={p} value={p}>{ENGAGEMENT_PHASE_LABELS[p]}</option>)}
          </select>
          <button onClick={() => setEditing((v) => !v)} className={SECONDARY}>{editing ? 'Close' : 'Edit'}</button>
        </div>
      </div>
      {editing && (
        <div className="mt-3">
          <EngagementForm
            buyerId={e.buyerId}
            existing={e}
            onDone={async () => {
              setEditing(false)
              await onChanged()
            }}
            onCancel={() => setEditing(false)}
          />
        </div>
      )}
    </div>
  )
}

function EngagementForm({ buyerId, existing, onDone, onCancel }: { buyerId: string; existing?: Engagement; onDone: () => Promise<void>; onCancel: () => void }) {
  const [name, setName] = useState(existing?.name ?? '')
  const [agentName, setAgentName] = useState(existing?.agentName ?? '')
  const [tier, setTier] = useState<EngagementTier>(existing?.tier ?? 'rapid')
  const [scope, setScope] = useState(existing?.scope ?? '')
  const [rules, setRules] = useState(existing?.rules ?? '')
  const [startsAt, setStartsAt] = useState(toDateInput(existing?.startsAt ?? null))
  const [endsAt, setEndsAt] = useState(toDateInput(existing?.endsAt ?? null))
  const [retestUntil, setRetestUntil] = useState(toDateInput(existing?.retestUntil ?? null))
  const [busy, setBusy] = useState(false)

  async function submit() {
    setBusy(true)
    try {
      const payload = {
        name: name.trim(),
        agentName: agentName.trim(),
        tier,
        scope,
        rules,
        startsAt: fromDateInput(startsAt),
        endsAt: fromDateInput(endsAt),
        retestUntil: fromDateInput(retestUntil),
      }
      if (existing) {
        const res = await updateEngagement(existing.id, payload)
        toast.success('Engagement saved', res.rulesVersion !== existing.rulesVersion ? `Rules are now version ${res.rulesVersion}. Every tester re-acknowledges before their next decision.` : existing.name)
      } else {
        await createEngagement({ buyerId, ...payload })
        toast.success('Engagement created', 'Existing scenarios for this client joined it; new ones will too.')
      }
      await onDone()
    } catch (err) {
      toast.error('Not saved', describeError(err, 'Check the fields.'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-3 rounded-md border border-border bg-background p-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="cx-meta text-navy-600">Engagement name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Support agent, pre-launch" className={`${INPUT} mt-1`} />
        </div>
        <div>
          <label className="cx-meta text-navy-600">Agent under test</label>
          <input value={agentName} onChange={(e) => setAgentName(e.target.value)} placeholder="SafariPay support agent" className={`${INPUT} mt-1`} />
        </div>
        <div>
          <label className="cx-meta text-navy-600">Tier</label>
          <select value={tier} onChange={(e) => setTier(e.target.value as EngagementTier)} className={`${INPUT} mt-1`}>
            {ENGAGEMENT_TIERS.map((t) => <option key={t} value={t}>{ENGAGEMENT_TIER_LABELS[t]}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="cx-meta text-navy-600">Starts</label>
            <input type="date" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} className={`${INPUT} mt-1`} />
          </div>
          <div>
            <label className="cx-meta text-navy-600">Ends</label>
            <input type="date" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} className={`${INPUT} mt-1`} />
          </div>
          <div>
            <label className="cx-meta text-navy-600">Retest until</label>
            <input type="date" value={retestUntil} onChange={(e) => setRetestUntil(e.target.value)} className={`${INPUT} mt-1`} />
          </div>
        </div>
      </div>
      <div>
        <label className="cx-meta text-navy-600">Scope (what is being tested)</label>
        <textarea value={scope} onChange={(e) => setScope(e.target.value)} rows={3} className={`${INPUT} mt-1`} placeholder="Endpoints, tools the agent can call, languages, flows, test accounts." />
      </div>
      <div>
        <label className="cx-meta text-navy-600">Rules of Engagement (one rule per line; testers must acknowledge before working)</label>
        <textarea value={rules} onChange={(e) => setRules(e.target.value)} rows={6} className={`${INPUT} mt-1 font-mono text-xs`} placeholder={'In scope: ...\nOut of scope: ...\nProof of concept only. ...'} />
        {existing && rules !== existing.rules && <p className="cx-meta mt-1 text-warning">Changing the rules bumps the version; every tester must acknowledge again.</p>}
      </div>
      <div className="flex gap-2">
        <button onClick={submit} disabled={busy || name.trim().length < 2 || agentName.trim().length < 2} className={PRIMARY}>{busy ? 'Saving…' : existing ? 'Save' : 'Create engagement'}</button>
        <button onClick={onCancel} disabled={busy} className={SECONDARY}>Cancel</button>
      </div>
    </div>
  )
}
