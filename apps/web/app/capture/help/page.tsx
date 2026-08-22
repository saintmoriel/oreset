import { Mail } from 'lucide-react'
import { CaptureAppShell } from '@/components/capture/capture-app-shell'
import { ERR_TAGS, ERR_TAG_LABELS } from '@oreset/shared'

export default function CaptureHelpPage() {
  return (
    <CaptureAppShell active="help">
      <p className="cx-label text-navy-400">Support</p>
      <h1 className="cx-page-title mt-1.5 text-navy-900">Help</h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1.4fr] lg:items-start">
        <div>
          <p className="cx-title text-navy-800">Talk to a person</p>
          <div className="cx-card mt-2.5 flex items-start gap-3 p-5">
            <Mail className="mt-0.5 size-4 shrink-0 text-accent" />
            <div>
              <p className="cx-body font-medium text-navy-900">hello@oreset.africa</p>
              <p className="cx-meta mt-0.5 text-navy-400">
                A real member of the Oreset team reads every message — no automated drip.
              </p>
              <div className="mt-3 flex flex-col gap-2">
                <a href="mailto:hello@oreset.africa" className="cx-meta font-semibold text-accent hover:underline">
                  Send a message
                </a>
                <a
                  href="mailto:hello@oreset.africa?subject=Payout%20issue"
                  className="cx-meta font-semibold text-accent hover:underline"
                >
                  Report a payout issue
                </a>
              </div>
            </div>
          </div>
        </div>

        <div>
          <p className="cx-title text-navy-800">Why submissions get rejected</p>
          <p className="cx-meta mt-0.5 text-navy-400">The four defect categories QA reviewers use.</p>
          <div className="mt-2.5 grid gap-3 sm:grid-cols-2">
            {ERR_TAGS.map((tag) => (
              <div key={tag} className="cx-card p-5">
                <span className="cx-meta rounded-full border border-border px-2 py-0.5 font-mono font-semibold text-navy-500">
                  {tag}
                </span>
                <p className="cx-body mt-2.5 text-navy-800">{ERR_TAG_LABELS[tag]}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </CaptureAppShell>
  )
}
