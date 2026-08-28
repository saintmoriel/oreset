import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { BuyerAppShell } from '@/components/buyer/buyer-app-shell'
import { serverApiFetch, redirectIfSignedOut } from '@/lib/api/server'
import type { MyDataset } from '@/lib/api/endpoints/buyer'

export default async function BuyerDatasetsPage() {
  let datasets: MyDataset[]
  try {
    ;({ datasets } = await serverApiFetch<{ datasets: MyDataset[] }>('/api/v1/buyer/datasets'))
  } catch (err) {
    redirectIfSignedOut(err, '/buyer')
  }

  return (
    <BuyerAppShell>
      <p className="cx-label text-navy-400">Your datasets</p>
      <h1 className="cx-page-title mt-1.5 text-navy-900">Delivered to you</h1>

      {datasets.length === 0 ? (
        <p className="cx-body mt-6 text-navy-400">
          Nothing delivered yet — datasets appear here once Oreset hands one off to your
          organization.
        </p>
      ) : (
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {datasets.map((d) => (
            <Link
              key={d.id}
              href={`/buyer/datasets/${d.id}`}
              className="cx-card flex flex-col gap-3 p-5 hover:border-accent/40"
            >
              <div className="flex items-center justify-between">
                <p className="cx-mono-meta font-semibold uppercase tracking-wider text-navy-400">
                  {d.items.length} item{d.items.length === 1 ? '' : 's'}
                </p>
                <ArrowRight className="size-4 shrink-0 text-navy-300" />
              </div>
              <div>
                <h2 className="cx-title text-navy-900">{d.title}</h2>
                <p className="cx-mono-meta mt-0.5 text-navy-400">
                  Delivered {new Date(d.deliveredAt).toLocaleDateString()}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </BuyerAppShell>
  )
}
