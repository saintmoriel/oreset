'use client'

import { useEffect, useState } from 'react'
import { Loader2, CheckCircle2, Circle, PenLine } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ApiError } from '@/lib/api/client'
import {
  getAgreements,
  signAgreement,
  type AgreementType,
  type RequiredAgreement,
  type OperatorAgreement,
} from '@/lib/api/endpoints/operator'

const AGREEMENT_DETAILS: Record<
  AgreementType,
  { title: string; summary: string }
> = {
  nda: {
    title: 'Non-Disclosure Agreement',
    summary:
      'You agree not to share, copy, or disclose any case data, client information, AI model outputs, or internal processes you encounter while reviewing cases on the Oreset platform. This obligation continues after your engagement ends.',
  },
  code_of_conduct: {
    title: 'Reviewer Code of Conduct',
    summary:
      'You agree to review cases honestly and impartially, report conflicts of interest, maintain professional standards, avoid fabricating or altering review data, and follow escalation procedures for cases outside your competence.',
  },
  data_handling: {
    title: 'Data Handling Policy',
    summary:
      'You agree to access case data only through the Oreset platform, not download or store case data on personal devices, report any suspected data breaches immediately, and comply with applicable data protection regulations.',
  },
}

export function AgreementsTab() {
  const [required, setRequired] = useState<RequiredAgreement[]>([])
  const [agreements, setAgreements] = useState<OperatorAgreement[]>([])
  const [loading, setLoading] = useState(true)
  const [signing, setSigning] = useState<AgreementType | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getAgreements()
      .then((res) => {
        setRequired(res.required)
        setAgreements(res.agreements)
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Could not load agreements.'))
      .finally(() => setLoading(false))
  }, [])

  async function handleSign(type: AgreementType) {
    setSigning(type)
    setError(null)

    try {
      const newAgreement = await signAgreement(type)
      setAgreements((prev) => [newAgreement, ...prev])
      setRequired((prev) =>
        prev.map((r) =>
          r.type === type ? { ...r, signed: true, signedAt: newAgreement.signedAt } : r,
        ),
      )
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not sign agreement.')
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

  const allSigned = required.every((r) => r.signed)
  const signedCount = required.filter((r) => r.signed).length

  return (
    <div className="space-y-6">
      {/* Status banner */}
      <div
        className={cn(
          'rounded-xl border p-5',
          allSigned
            ? 'border-success/30 bg-success/5'
            : 'border-border bg-card',
        )}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-navy-900">Signed Agreements</p>
            <p className="text-xs text-navy-400 mt-0.5">
              {allSigned
                ? 'All required agreements have been signed.'
                : 'Review and sign each agreement to begin working on cases.'}
            </p>
          </div>
          <span
            className={cn(
              'rounded-full px-2.5 py-0.5 text-[11px] font-semibold tabular-nums',
              allSigned ? 'bg-success/10 text-success' : 'bg-navy-100 text-navy-500',
            )}
          >
            {signedCount}/{required.length}
          </span>
        </div>
      </div>

      {/* Agreement cards */}
      <div className="space-y-4">
        {required.map((req) => {
          const details = AGREEMENT_DETAILS[req.type]
          const isSigning = signing === req.type

          return (
            <div
              key={req.type}
              className={cn(
                'rounded-xl border bg-card overflow-hidden',
                req.signed ? 'border-success/20' : 'border-border',
              )}
            >
              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    {req.signed ? (
                      <CheckCircle2 className="size-5 shrink-0 text-success mt-0.5" />
                    ) : (
                      <Circle className="size-5 shrink-0 text-navy-300 mt-0.5" />
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-navy-900">{details.title}</p>
                      <p className="text-xs text-navy-500 mt-1 leading-relaxed">
                        {details.summary}
                      </p>
                      {req.signed && req.signedAt && (
                        <p className="text-[11px] text-navy-400 mt-2">
                          Signed on {new Date(req.signedAt).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </p>
                      )}
                    </div>
                  </div>

                  {!req.signed && (
                    <button
                      type="button"
                      onClick={() => handleSign(req.type)}
                      disabled={isSigning}
                      className="shrink-0 inline-flex items-center gap-1.5 rounded-md bg-accent px-4 py-2 text-xs font-semibold text-white hover:bg-accent/90 disabled:opacity-50"
                    >
                      {isSigning ? (
                        <>
                          <Loader2 className="size-3 animate-spin" />
                          Signing...
                        </>
                      ) : (
                        <>
                          <PenLine className="size-3" />
                          Sign
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <p className="text-[11px] text-navy-400">
        By signing, you agree to the terms outlined in each agreement. A record of every signed agreement
        is kept and can be referenced here at any time. Agreements are version-tracked — if terms change,
        you will be asked to review and sign the updated version.
      </p>
    </div>
  )
}
