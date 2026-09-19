'use client'

import { useEffect, useState } from 'react'
import { Check, ScrollText } from 'lucide-react'
import { ENGAGEMENT_TIER_LABELS } from '@oreset/shared'
import { toast } from '@/components/ui/toast'
import { describeError } from '@/lib/api/client'
import { acknowledgeEngagementRules, getEngagementRules, type EngagementRules } from '@/lib/api/endpoints/engagements'

// Shown before a tester's first decision on an engagement, and again
// whenever the rules change. Nothing else on the page until they agree.
export function RulesOfEngagementPanel({ engagementId, onAcknowledged }: { engagementId: string; onAcknowledged: () => void }) {
  const [rules, setRules] = useState<EngagementRules | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [agreed, setAgreed] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    getEngagementRules(engagementId)
      .then(setRules)
      .catch((err) => setError(describeError(err, 'Could not load the Rules of Engagement.')))
  }, [engagementId])

  async function acknowledge() {
    setBusy(true)
    try {
      await acknowledgeEngagementRules(engagementId)
      toast.success('Acknowledged', 'You can work this client’s scenarios now.')
      onAcknowledged()
    } catch (err) {
      toast.error('Not recorded', describeError(err, 'Try again.'))
    } finally {
      setBusy(false)
    }
  }

  if (error) return <p className="cx-body text-destructive" role="alert">{error}</p>
  if (!rules) return <p className="cx-body text-navy-400">Loading the Rules of Engagement…</p>

  return (
    <div className="mx-auto max-w-3xl">
      <div className="cx-card p-6 sm:p-8">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent"><ScrollText className="size-5" /></span>
          <div>
            <p className="cx-label text-navy-400">Rules of Engagement · version {rules.rulesVersion}</p>
            <h1 className="cx-page-title mt-1 text-navy-900">{rules.name}</h1>
            <p className="cx-meta mt-1 text-navy-500">{rules.agentName} · {ENGAGEMENT_TIER_LABELS[rules.tier]}</p>
          </div>
        </div>

        <p className="cx-body mt-5 text-navy-600">
          Read this before your first scenario for this client. It says exactly what you may test, what you must not touch, and what to do if
          something unexpected appears. If it is not written here, it is not authorised.
        </p>

        {rules.scope && (
          <section className="mt-6">
            <p className="cx-label text-navy-400">Scope</p>
            <p className="cx-body mt-1.5 whitespace-pre-line text-navy-800">{rules.scope}</p>
          </section>
        )}

        <section className="mt-6">
          <p className="cx-label text-navy-400">Rules</p>
          <ol className="mt-1.5 space-y-2">
            {rules.rules.split('\n').filter((l) => l.trim()).map((line, i) => (
              <li key={i} className="cx-body flex gap-3 text-navy-800">
                <span className="cx-mono-meta mt-0.5 shrink-0 text-navy-400">{String(i + 1).padStart(2, '0')}</span>
                <span>{line}</span>
              </li>
            ))}
          </ol>
        </section>

        <label className="mt-8 flex cursor-pointer items-start gap-3 rounded-md border border-border p-4 hover:bg-navy-50/60">
          <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-1 size-4 accent-accent" />
          <span className="cx-body text-navy-800">
            I have read these Rules of Engagement and will work only within them. I understand that going outside them ends my work with Oreset.
          </span>
        </label>

        <button
          onClick={acknowledge}
          disabled={!agreed || busy}
          className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-accent px-6 text-sm font-semibold text-accent-foreground hover:bg-copper-600 disabled:opacity-50"
        >
          {busy ? 'Recording…' : 'I acknowledge the Rules of Engagement'}
          {!busy && <Check className="size-4" />}
        </button>
        <p className="cx-meta mt-3 text-center text-navy-400">Your acknowledgement is recorded with the time and rules version.</p>
      </div>
    </div>
  )
}
