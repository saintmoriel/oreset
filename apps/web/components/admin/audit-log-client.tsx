'use client'

import { useMemo, useState } from 'react'
import { cn } from '@/lib/utils'
import type { AuditLogEntry } from '@/lib/api/endpoints/audit'

export function AuditLogClient({ entries }: { entries: AuditLogEntry[] }) {
  const [action, setAction] = useState('all')
  const [actorRole, setActorRole] = useState('all')
  const [resourceType, setResourceType] = useState('all')

  const actions = useMemo(() => Array.from(new Set(entries.map((e) => e.action))).sort(), [entries])
  const actorRoles = useMemo(() => Array.from(new Set(entries.map((e) => e.actorRole))).sort(), [entries])
  const resourceTypes = useMemo(
    () => Array.from(new Set(entries.map((e) => e.resourceType).filter((r): r is string => Boolean(r)))).sort(),
    [entries],
  )

  const filtered = useMemo(
    () =>
      entries.filter((e) => {
        if (action !== 'all' && e.action !== action) return false
        if (actorRole !== 'all' && e.actorRole !== actorRole) return false
        if (resourceType !== 'all' && e.resourceType !== resourceType) return false
        return true
      }),
    [entries, action, actorRole, resourceType],
  )

  return (
    <div>
      {entries.length > 0 && (
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <Select label="Action" value={action} onChange={setAction} options={actions} />
          <Select label="Actor role" value={actorRole} onChange={setActorRole} options={actorRoles} />
          <Select label="Resource" value={resourceType} onChange={setResourceType} options={resourceTypes} />
        </div>
      )}

      {entries.length === 0 ? (
        <p className="cx-body mt-6 text-navy-400">Nothing logged yet.</p>
      ) : filtered.length === 0 ? (
        <p className="cx-body mt-6 text-navy-400">No entries match these filters.</p>
      ) : (
        <div className="cx-card mt-4 divide-y divide-border">
          {filtered.map((e) => (
            <div key={e.id} className="flex items-center justify-between gap-4 p-4">
              <div>
                <p className="cx-mono-meta font-semibold text-navy-800">{e.action}</p>
                <p className="cx-mono-meta mt-0.5 text-navy-400">
                  {e.actorLabel} · {e.actorRole}
                  {e.resourceType ? ` · ${e.resourceType}` : ''}
                </p>
              </div>
              <p className="cx-mono-meta shrink-0 text-navy-300">{new Date(e.createdAt).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: string[]
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={label}
      className={cn(
        'h-8 rounded-md border border-border bg-background px-2 cx-meta text-navy-800 outline-none focus-visible:border-accent',
        value === 'all' && 'text-navy-400',
      )}
    >
      <option value="all">{label}: all</option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  )
}
