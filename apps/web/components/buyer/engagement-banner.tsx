import { Check } from 'lucide-react'
import { ENGAGEMENT_PHASES, ENGAGEMENT_PHASE_DESCRIPTIONS, ENGAGEMENT_PHASE_LABELS, ENGAGEMENT_TIER_LABELS } from '@oreset/shared'
import type { Engagement } from '@/lib/api/endpoints/engagements'

function fmt(d: string | null) {
  return d ? new Date(d).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }) : null
}

// Where the client's engagement stands, and what they should be doing now.
export function EngagementBanner({ engagement }: { engagement: Engagement }) {
  const steps = ENGAGEMENT_PHASES.filter((p) => p !== 'closed')
  const idx = engagement.phase === 'closed' ? steps.length : steps.indexOf(engagement.phase)
  const window = [fmt(engagement.startsAt), fmt(engagement.endsAt)].filter(Boolean).join(' to ')

  return (
    <div className="cx-card p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="cx-label text-navy-400">{ENGAGEMENT_TIER_LABELS[engagement.tier]}</p>
          <p className="cx-title mt-0.5 text-navy-900">{engagement.name}</p>
          <p className="cx-meta mt-0.5 text-navy-500">
            {engagement.agentName}
            {window ? ` · ${window}` : ''}
            {engagement.retestUntil ? ` · free retest until ${fmt(engagement.retestUntil)}` : ''}
          </p>
        </div>
        <span className={`cx-meta rounded-full px-3 py-1 font-semibold ${engagement.phase === 'closed' ? 'bg-navy-100 text-navy-600' : 'bg-accent/10 text-accent'}`}>
          {ENGAGEMENT_PHASE_LABELS[engagement.phase]}
        </span>
      </div>

      <ol className="mt-5 grid grid-cols-4 gap-2">
        {steps.map((p, i) => {
          const done = i < idx
          const current = i === idx
          return (
            <li key={p} className="min-w-0">
              <div className={`h-1.5 rounded-full ${done || current ? 'bg-accent' : 'bg-navy-100'}`} />
              <p className={`cx-meta mt-1.5 flex items-center gap-1 truncate ${current ? 'font-semibold text-navy-900' : done ? 'text-navy-500' : 'text-navy-300'}`}>
                {done && <Check className="size-3" />}
                {ENGAGEMENT_PHASE_LABELS[p]}
              </p>
            </li>
          )
        })}
      </ol>

      <p className="cx-body mt-4 text-navy-600">{ENGAGEMENT_PHASE_DESCRIPTIONS[engagement.phase]}</p>
    </div>
  )
}
