import Link from 'next/link'
import { ArrowRight, Package } from 'lucide-react'
import { BuyerShell } from '@/components/buyer/buyer-shell'
import { serverApiFetch } from '@/lib/api/server'
import type { MyDataset } from '@/lib/api/endpoints/buyer'

export default async function BuyerDatasetsPage() {
  const { datasets } = await serverApiFetch<{ datasets: MyDataset[] }>('/api/v1/buyer/datasets')

  return (
    <BuyerShell>
      <p className="text-eyebrow text-accent">Your datasets</p>
      <h1 className="text-h1 mt-2 text-balance text-foreground">Delivered to you</h1>

      {datasets.length === 0 ? (
        <p className="mt-6 text-body-sm text-muted-foreground">
          Nothing delivered yet — datasets appear here once Oreset hands one off to your
          organization.
        </p>
      ) : (
        <ul className="mt-8 space-y-3">
          {datasets.map((d) => (
            <li key={d.id}>
              <Link
                href={`/buyer/datasets/${d.id}`}
                className="card-surface-raised flex flex-col items-start gap-4 p-6 hover:border-accent/40 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent/10">
                    <Package className="size-5 text-accent" />
                  </span>
                  <div>
                    <p className="text-body font-semibold text-foreground">{d.title}</p>
                    <p className="text-body-sm mt-1 text-muted-foreground">
                      {d.items.length} item{d.items.length === 1 ? '' : 's'} · delivered{' '}
                      {new Date(d.deliveredAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </BuyerShell>
  )
}
