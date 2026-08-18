'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { AdminShell } from '@/components/admin/admin-shell'
import { ORIGIN_STAGES, OPERATOR_STAGES, ROLES, type RoleId } from '@/lib/admin-mock-data'

function DashboardContent() {
  const params = useSearchParams()
  const role = (ROLES.find((r) => r.id === params.get('role'))?.id ?? 'admin') as RoleId

  return (
    <AdminShell role={role}>
      <div className="space-y-8">
        <div>
          <p className="text-eyebrow text-accent">Origin · Pipeline</p>
          <h1 className="text-h2 mt-2 text-foreground">Stage overview</h1>
          <p className="text-body-sm mt-1 text-muted-foreground">
            Item counts currently sitting in each stage of the 10-stage Origin pipeline.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
            {ORIGIN_STAGES.map((stage, i) => (
              <div key={stage.name} className="card-surface p-4">
                <p className="text-caption font-medium text-muted-foreground">
                  {i + 1}. {stage.name}
                </p>
                <p className="text-h3 tabular mt-1 text-foreground">{stage.count}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-eyebrow text-accent">Operators · Cohort pipeline</p>
          <h2 className="text-h3 mt-2 text-foreground">Cohort stage overview</h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-6">
            {OPERATOR_STAGES.map((stage, i) => (
              <div key={stage.name} className="card-surface p-4">
                <p className="text-caption font-medium text-muted-foreground">
                  {i + 1}. {stage.name}
                </p>
                <p className="text-h3 tabular mt-1 text-foreground">{stage.count}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminShell>
  )
}

export default function DashboardPage() {
  return (
    <Suspense>
      <DashboardContent />
    </Suspense>
  )
}
