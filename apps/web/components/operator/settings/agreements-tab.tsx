'use client'

import { useEffect, useState } from 'react'
import { Loader2, CheckCircle2, Circle, PenLine, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { describeError } from '@/lib/api/client'
import { toast } from '@/components/ui/toast'
import { getAgreements, signAgreement, type AgreementType, type RequiredAgreement } from '@/lib/api/endpoints/operator'

// Five acceptances, each shown in full. The platform records the exact text,
// version, time and IP, so what was agreed is provable later.
export function AgreementsTab() {
  const [required, setRequired] = useState<RequiredAgreement[]>([])
  const [loading, setLoading] = useState(true)
  const [signing, setSigning] = useState<AgreementType | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    try {
      const res = await getAgreements()
      setRequired(res.required)
    } catch (err) {
      setError(describeError(err, 'Could not load agreements.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  async function handleSign(type: AgreementType) {
    setSigning(type)
    try {
      await signAgreement(type)
      toast.success('Accepted', required.find((r) => r.type === type)?.label ?? 'Agreement')
      await load()
    } catch (err) {
      toast.error('Not recorded', describeError(err, 'Try again.'))
    } finally {
      setSigning(null)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center p-16">
        <Loader2 className="size-8 animate-spin text-accent" />
      </div>
    )
  }
  if (error) return <p className="text-sm text-destructive" role="alert">{error}</p>

  const signedCount = required.filter((r) => r.signed).length
  const allSigned = signedCount === required.length

  return (
    <div className="space-y-6">
      <div className={cn('rounded-xl border p-5', allSigned ? 'border-success/30 bg-success/5' : 'border-border bg-card')}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-navy-900">Your agreements</p>
            <p className="mt-0.5 text-xs text-navy-400">
              {allSigned
                ? 'Every agreement is accepted at its current version.'
                : 'Read and accept each one before you are assigned client work. When a text changes, you will be asked to accept the new version.'}
            </p>
          </div>
          <span className={cn('rounded-full px-2.5 py-0.5 text-[11px] font-semibold tabular-nums', allSigned ? 'bg-success/10 text-success' : 'bg-navy-100 text-navy-500')}>
            {signedCount}/{required.length}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {required.map((req) => (
          <AgreementCard key={req.type} req={req} signing={signing === req.type} onSign={() => handleSign(req.type)} />
        ))}
      </div>

      <p className="text-[11px] text-navy-400">
        For each acceptance we store the exact text you saw, its version, the date and time, and your IP address. The full legal
        documents these summarise are available from Oreset on request.
      </p>
    </div>
  )
}

function AgreementCard({ req, signing, onSign }: { req: RequiredAgreement; signing: boolean; onSign: () => void }) {
  const [open, setOpen] = useState(!req.signed)
  const [read, setRead] = useState(false)

  return (
    <div className={cn('overflow-hidden rounded-xl border bg-card', req.signed ? 'border-success/20' : req.outdated ? 'border-warning/40' : 'border-border')}>
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            {req.signed ? <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-success" /> : req.outdated ? <RefreshCw className="mt-0.5 size-5 shrink-0 text-warning" /> : <Circle className="mt-0.5 size-5 shrink-0 text-navy-300" />}
            <div className="min-w-0">
              <p className="text-sm font-semibold text-navy-900">
                {req.label} <span className="ml-1 font-mono text-[11px] font-normal text-navy-400">v{req.version}</span>
              </p>
              <p className="mt-1 text-xs leading-relaxed text-navy-500">{req.summary}</p>
              {req.signed && req.signedAt && (
                <p className="mt-2 text-[11px] text-navy-400">Accepted on {new Date(req.signedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              )}
              {req.outdated && (
                <p className="mt-2 text-[11px] font-medium text-warning">You accepted version {req.previousVersion}. The text has changed; read and accept the new version.</p>
              )}
            </div>
          </div>
          <button type="button" onClick={() => setOpen((o) => !o)} className="shrink-0 inline-flex items-center gap-1 text-xs font-medium text-navy-500 hover:text-accent">
            {open ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
            {open ? 'Hide' : 'Read'}
          </button>
        </div>

        {open && (
          <div className="mt-4">
            <pre className="max-h-96 overflow-y-auto whitespace-pre-wrap rounded-md border border-border bg-navy-50/60 p-4 font-sans text-xs leading-relaxed text-navy-800" onScroll={(e) => {
              const el = e.currentTarget
              if (el.scrollTop + el.clientHeight >= el.scrollHeight - 8) setRead(true)
            }}>
              {req.text}
            </pre>
            {!req.signed && (
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <label className="flex items-center gap-2 text-xs text-navy-700">
                  <input type="checkbox" checked={read} onChange={(e) => setRead(e.target.checked)} className="size-4 accent-accent" />
                  I have read the whole text and agree to it.
                </label>
                <button
                  type="button"
                  onClick={onSign}
                  disabled={signing || !read}
                  className="inline-flex items-center gap-1.5 rounded-md bg-accent px-4 py-2 text-xs font-semibold text-white hover:bg-accent/90 disabled:opacity-50"
                >
                  {signing ? <Loader2 className="size-3 animate-spin" /> : <PenLine className="size-3" />}
                  {signing ? 'Recording…' : req.outdated ? 'Accept new version' : 'Accept'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
