import { serverApiFetch } from '@/lib/api/server'
import { CaptureAppShell } from '@/components/capture/capture-app-shell'
import { AccountActions } from '@/components/capture/account-actions'
import type { ConsentRecordSummary } from '@/lib/api/endpoints/me'

const WHATS_STORED = [
  'Your phone number, used to sign you in',
  'Metadata about each submission — when it was captured, on what device, and (for photos) roughly where',
  'A consent record for each batch you agreed to work on',
  'Your payout method details, if you’ve added them',
]

export default async function CapturePrivacyPage() {
  const { consentRecords } = await serverApiFetch<{ consentRecords: ConsentRecordSummary[] }>(
    '/api/v1/me/consent-records',
  )

  return (
    <CaptureAppShell active="privacy">
      <p className="cx-label text-navy-400">GDPR / NDPR</p>
      <h1 className="cx-page-title mt-1.5 text-navy-900">Data &amp; privacy</h1>
      <p className="cx-body mt-2 max-w-2xl text-navy-500">
        Download everything Oreset holds about you, or permanently anonymize your account.
        Withdrawing consent here is exactly as easy as giving it was.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-2 lg:items-start">
        <div>
          <p className="cx-title text-navy-800">What&apos;s stored</p>
          <ul className="mt-2.5 space-y-2">
            {WHATS_STORED.map((item) => (
              <li key={item} className="cx-body flex items-start gap-2 text-navy-500">
                <span className="mt-1.5 size-1 shrink-0 rounded-full bg-navy-300" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>

          <div className="mt-6">
            <AccountActions />
          </div>
        </div>

        <div>
          <p className="cx-title text-navy-800">Consent record reference</p>
          <p className="cx-meta mt-0.5 text-navy-400">Which batches you agreed to work on, and when.</p>
          {consentRecords.length === 0 ? (
            <p className="cx-body mt-2.5 text-navy-400">No consent records yet.</p>
          ) : (
            <div className="cx-card mt-2.5 divide-y divide-border">
              {consentRecords.map((record) => (
                <div key={record.id} className="flex items-center justify-between gap-4 p-4">
                  <p className="cx-body font-medium text-navy-900">{record.batch?.title ?? 'Deleted batch'}</p>
                  <p className="cx-meta text-navy-400">{new Date(record.consentedAt).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </CaptureAppShell>
  )
}
