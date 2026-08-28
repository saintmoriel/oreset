import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Download } from 'lucide-react'
import { BuyerAppShell } from '@/components/buyer/buyer-app-shell'
import { VerificationSeal } from '@/components/capture/verification-seal'
import { serverApiFetch } from '@/lib/api/server'
import { ApiError } from '@/lib/api/client'
import type { MyDatasetDetail } from '@/lib/api/endpoints/buyer'

const API_URL = process.env.NEXT_PUBLIC_API_URL

export default async function BuyerDatasetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  let dataset: MyDatasetDetail
  try {
    ;({ dataset } = await serverApiFetch<{ dataset: MyDatasetDetail }>(`/api/v1/buyer/datasets/${id}`))
  } catch (err) {
    // The API already returns 404 (not 403) for "not yours or doesn't
    // exist" — notFound() carries that through as a real HTTP 404 from
    // this page too, instead of an uncaught-throw 500.
    if (err instanceof ApiError && err.status === 404) notFound()
    throw err
  }

  return (
    <BuyerAppShell>
      <Link
        href="/buyer/datasets"
        className="inline-flex items-center gap-1.5 cx-meta font-medium text-navy-500 hover:text-navy-800"
      >
        <ArrowLeft className="size-4" />
        Your datasets
      </Link>

      <p className="cx-label mt-6 text-accent">{dataset.campaign.title}</p>
      <h1 className="cx-page-title mt-1.5 text-balance text-navy-900">{dataset.title}</h1>

      <div className="mt-6 flex items-center gap-3 rounded-xl border border-accent/30 bg-accent/5 p-5">
        <VerificationSeal label="Provenance sealed" />
        <p className="cx-mono-meta break-all text-navy-400">{dataset.provenanceHash}</p>
      </div>

      <div className="cx-card mt-6 p-5">
        <p className="cx-body font-semibold text-navy-900">License terms</p>
        <p className="cx-meta mt-2 text-navy-500">{dataset.licenseTerms}</p>
      </div>

      <h2 className="cx-title mt-10 text-navy-900">
        {dataset.items.length} item{dataset.items.length === 1 ? '' : 's'}
      </h2>
      <div className="cx-card mt-4 divide-y divide-border">
        {dataset.items.map((item) => (
          <div key={item.id} className="flex items-center justify-between gap-4 p-4">
            <div>
              <p className="cx-mono-meta font-semibold uppercase tracking-wider text-navy-400">
                {item.mediaType}
              </p>
              <p className="cx-mono-meta mt-0.5 text-navy-800">{item.id}</p>
              <p className="cx-meta text-navy-400">
                {item.mimeType}
                {item.durationSeconds ? ` · ${item.durationSeconds}s` : ''}
              </p>
              {item.lastDownloadedAt && (
                <p className="cx-mono-meta mt-1 text-navy-300">
                  Downloaded {new Date(item.lastDownloadedAt).toLocaleString()}
                </p>
              )}
            </div>
            {item.downloadUrl ? (
              <a
                href={`${API_URL}/api/v1/buyer/datasets/${dataset.id}/items/${item.id}/download`}
                className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md border border-border px-3 cx-meta font-semibold text-navy-800 hover:bg-navy-50"
              >
                <Download className="size-3.5" />
                Download
              </a>
            ) : (
              <span className="cx-meta shrink-0 text-navy-400">File purged</span>
            )}
          </div>
        ))}
      </div>
    </BuyerAppShell>
  )
}
