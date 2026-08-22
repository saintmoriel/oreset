import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Download, FileAudio, FileImage, ShieldCheck } from 'lucide-react'
import { BuyerShell } from '@/components/buyer/buyer-shell'
import { serverApiFetch } from '@/lib/api/server'
import { ApiError } from '@/lib/api/client'
import type { MyDatasetDetail } from '@/lib/api/endpoints/buyer'

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
    <BuyerShell>
      <Link
        href="/buyer/datasets"
        className="inline-flex items-center gap-1.5 text-body-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Your datasets
      </Link>

      <p className="text-eyebrow mt-6 text-accent">{dataset.campaign.title}</p>
      <h1 className="text-h1 mt-2 text-balance text-foreground">{dataset.title}</h1>

      <div className="mt-6 flex items-start gap-3 rounded-xl border border-success/30 bg-success/5 p-5">
        <ShieldCheck className="mt-0.5 size-5 shrink-0 text-success" />
        <div>
          <p className="text-body-sm font-semibold text-foreground">Provenance sealed</p>
          <p className="font-mono text-caption mt-1 break-all text-muted-foreground">
            {dataset.provenanceHash}
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-border bg-paper-100 p-5">
        <p className="text-body-sm font-semibold text-foreground">License terms</p>
        <p className="text-body-sm mt-2 text-muted-foreground">{dataset.licenseTerms}</p>
      </div>

      <h2 className="text-h4 mt-10 text-foreground">
        {dataset.items.length} item{dataset.items.length === 1 ? '' : 's'}
      </h2>
      <ul className="mt-4 divide-y divide-border/70 border-y border-border/70">
        {dataset.items.map((item) => {
          const Icon = item.mediaType === 'audio' ? FileAudio : FileImage
          return (
            <li key={item.id} className="flex items-center justify-between gap-4 py-3.5">
              <div className="flex items-center gap-3">
                <span className="flex size-8 items-center justify-center rounded-full bg-muted">
                  <Icon className="size-4 text-muted-foreground" />
                </span>
                <div>
                  <p className="font-mono text-body-sm font-medium text-foreground">{item.id}</p>
                  <p className="text-caption text-muted-foreground">
                    {item.mimeType}
                    {item.durationSeconds ? ` · ${item.durationSeconds}s` : ''}
                  </p>
                </div>
              </div>
              {item.downloadUrl ? (
                <a
                  href={item.downloadUrl}
                  className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border px-3 text-caption font-semibold text-foreground hover:bg-muted"
                >
                  <Download className="size-3.5" />
                  Download
                </a>
              ) : (
                <span className="text-caption text-muted-foreground">File purged</span>
              )}
            </li>
          )
        })}
      </ul>
    </BuyerShell>
  )
}
