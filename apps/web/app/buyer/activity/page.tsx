import Link from 'next/link'
import { BuyerAppShell } from '@/components/buyer/buyer-app-shell'
import { serverApiFetch, redirectIfSignedOut } from '@/lib/api/server'
import type { BuyerDownloadRecord } from '@/lib/api/endpoints/buyer'

export default async function BuyerActivityPage() {
  let downloads: BuyerDownloadRecord[]
  try {
    ;({ downloads } = await serverApiFetch<{ downloads: BuyerDownloadRecord[] }>('/api/v1/buyer/me/downloads'))
  } catch (err) {
    redirectIfSignedOut(err, '/buyer')
  }

  return (
    <BuyerAppShell>
      <p className="cx-label text-navy-400">Activity</p>
      <h1 className="cx-page-title mt-1.5 text-navy-900">Download history</h1>
      <p className="cx-body mt-2 max-w-2xl text-navy-500">
        Every time you download an item from a delivered dataset, it&apos;s logged here.
      </p>

      {downloads.length === 0 ? (
        <p className="cx-body mt-6 text-navy-400">
          Nothing downloaded yet — download links live on each dataset&apos;s detail page.
        </p>
      ) : (
        <div className="cx-card mt-6 divide-y divide-border">
          {downloads.map((d) => (
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
    </BuyerAppShell>
  )
}
