import Link from 'next/link'
import { ArrowRight, Package } from 'lucide-react'
import { serverApiFetch, redirectIfSignedOut } from '@/lib/api/server'
import { BuyerAppShell } from '@/components/buyer/buyer-app-shell'
import type { BuyerStats, BuyerDownloadRecord } from '@/lib/api/endpoints/buyer'

export default async function BuyerHomePage() {
  let stats: BuyerStats
  let downloads: BuyerDownloadRecord[]
  try {
    ;[stats, { downloads }] = await Promise.all([
      serverApiFetch<BuyerStats>('/api/v1/buyer/me/stats'),
      serverApiFetch<{ downloads: BuyerDownloadRecord[] }>('/api/v1/buyer/me/downloads'),
    ])
  } catch (err) {
    redirectIfSignedOut(err, '/buyer')
  }

  const recent = downloads.slice(0, 5)

  return (
    <BuyerAppShell>
      <p className="cx-label text-navy-400">Welcome back</p>
      <h1 className="cx-page-title mt-1.5 text-navy-900">Home</h1>

      {/* Hero — a real, cumulative inventory number: what this buyer
          actually has, not what they did today (a buyer receives
          occasional deliveries, not continuous daily work). */}
      <div className="mt-6 rounded-xl border border-navy-900 bg-navy-900 p-6 sm:p-8">
        <p className="cx-label text-copper-300">Items licensed</p>
        <p className="mt-2 font-mono text-4xl font-semibold tracking-tight tabular-nums text-white sm:text-5xl">
          {stats.itemsLicensed}
        </p>
      </div>

      <Link
        href="/buyer/datasets"
        className="cx-card mt-8 flex items-center justify-between gap-4 border-accent/30 bg-accent/5 p-6 hover:bg-accent/10"
      >
        <div className="flex items-center gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-accent/15 text-accent">
            <Package className="size-6" />
          </span>
          <div>
            <p className="cx-label text-accent">Datasets</p>
            <p className="cx-title mt-0.5 text-navy-900">Delivered to your organization</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="cx-stat text-navy-900">{stats.datasetsDelivered}</p>
            <p className="cx-meta text-navy-400">datasets</p>
          </div>
          <ArrowRight className="size-5 shrink-0 text-accent" />
        </div>
      </Link>

      <div className="cx-card mt-6 grid grid-cols-1 divide-y divide-border sm:grid-cols-2 sm:divide-x sm:divide-y-0">
        <div className="p-5">
          <p className="cx-meta text-navy-400">Datasets delivered</p>
          <p className="cx-stat mt-1 text-navy-900">{stats.datasetsDelivered}</p>
        </div>
        <div className="p-5">
          <p className="cx-meta text-navy-400">Downloads</p>
          <p className="cx-stat mt-1 text-navy-900">{stats.downloadsTotal}</p>
        </div>
      </div>

      <div className="mt-8">
        <p className="cx-label text-navy-400">Recent activity</p>
        {recent.length === 0 ? (
          <p className="cx-body mt-2.5 text-navy-400">No downloads yet.</p>
        ) : (
          <div className="cx-card mt-2.5 divide-y divide-border">
            {recent.map((d) => (
              <Link
                key={d.id}
                href={`/buyer/datasets/${d.dataset.id}`}
                className="flex items-center justify-between gap-4 p-4 hover:bg-navy-50"
              >
                <div>
                  <p className="cx-body font-medium text-navy-900">{d.dataset.title}</p>
                  <p className="cx-mono-meta text-navy-400">{new Date(d.createdAt).toLocaleString()}</p>
                </div>
                <span className="cx-mono-meta font-semibold uppercase tracking-wider text-navy-400">
                  {d.submission.mediaType}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </BuyerAppShell>
  )
}
