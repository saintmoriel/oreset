'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Download, Trash2 } from 'lucide-react'
import { getDataExport, deleteAccount } from '@/lib/api/endpoints/me'
import { ApiError } from '@/lib/api/client'

export function AccountActions() {
  const router = useRouter()
  const [exporting, setExporting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onExport() {
    setExporting(true)
    setError(null)
    try {
      const bundle = await getDataExport()
      const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'oreset-my-data.json'
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not export your data. Try again.')
    } finally {
      setExporting(false)
    }
  }

  async function onDelete() {
    setDeleting(true)
    setError(null)
    try {
      await deleteAccount()
      router.push('/capture')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not delete your account. Try again.')
      setDeleting(false)
    }
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="cx-card flex flex-col justify-between gap-4 p-5">
        <div>
          <p className="cx-body font-medium text-navy-900">Download your data</p>
          <p className="cx-meta mt-0.5 text-navy-400">A full export of everything tied to your account.</p>
        </div>
        <button
          onClick={onExport}
          disabled={exporting}
          className="inline-flex h-9 w-fit shrink-0 items-center gap-1.5 rounded-md border border-border px-3 cx-meta font-medium text-navy-800 hover:bg-navy-50 disabled:opacity-60"
        >
          <Download className="size-3.5" />
          {exporting ? 'Preparing…' : 'Download my data'}
        </button>
      </div>

      <div className="cx-card p-5">
        <p className="cx-body font-medium text-navy-900">Delete account</p>
        <p className="cx-meta mt-0.5 text-navy-400">Anonymizes your identity and revokes every session.</p>
        {!confirming ? (
          <button
            onClick={() => setConfirming(true)}
            className="mt-4 inline-flex h-9 w-fit shrink-0 items-center gap-1.5 rounded-md border border-destructive/30 px-3 cx-meta font-medium text-destructive hover:bg-destructive/5"
          >
            <Trash2 className="size-3.5" />
            Delete my account
          </button>
        ) : (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="cx-meta text-navy-400">Sure? This can&apos;t be undone.</span>
            <button
              onClick={onDelete}
              disabled={deleting}
              className="h-8 rounded-md bg-destructive px-3 cx-meta font-semibold text-destructive-foreground hover:bg-destructive/90 disabled:opacity-60"
            >
              {deleting ? 'Deleting…' : 'Confirm delete'}
            </button>
            <button
              onClick={() => setConfirming(false)}
              className="h-8 rounded-md border border-border px-3 cx-meta font-medium text-navy-800 hover:bg-navy-50"
            >
              Cancel
            </button>
          </div>
        )}
        {error && <p className="mt-3 cx-meta text-destructive">{error}</p>}
      </div>
    </div>
  )
}
