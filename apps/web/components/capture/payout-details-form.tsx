'use client'

import { useState, type FormEvent } from 'react'
import { Wallet } from 'lucide-react'
import { setPayoutDetails } from '@/lib/api/endpoints/payouts'
import { ApiError } from '@/lib/api/client'

export function PayoutDetailsForm({ hasDetailsOnFile }: { hasDetailsOnFile: boolean }) {
  const [provider, setProvider] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await setPayoutDetails({ type: 'mobile_money', provider, accountNumber })
      setSaved(true)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not save payout details. Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (hasDetailsOnFile || saved) {
    return (
      <p className="mt-2 flex items-center gap-1.5 cx-body text-navy-400">
        <Wallet className="size-3.5" />
        Payout details on file.
      </p>
    )
  }

  return (
    <form onSubmit={onSubmit} className="mt-2.5 flex flex-col gap-2 sm:flex-row sm:items-end">
      <div className="flex-1">
        <label className="cx-meta font-medium text-navy-800">Mobile money provider</label>
        <input
          required
          value={provider}
          onChange={(e) => setProvider(e.target.value)}
          placeholder="MTN, Airtel, ..."
          className="mt-1 h-10 w-full rounded-md border border-border bg-background px-3 cx-body text-navy-900 outline-none placeholder:text-navy-300 focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/20"
        />
      </div>
      <div className="flex-1">
        <label className="cx-meta font-medium text-navy-800">Account number</label>
        <input
          required
          value={accountNumber}
          onChange={(e) => setAccountNumber(e.target.value)}
          className="mt-1 h-10 w-full rounded-md border border-border bg-background px-3 cx-body text-navy-900 outline-none focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/20"
        />
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="h-10 shrink-0 rounded-md bg-accent px-4 text-sm font-semibold text-accent-foreground hover:bg-copper-600 disabled:opacity-60"
      >
        {submitting ? 'Saving…' : 'Save'}
      </button>
      {error && <p className="cx-meta text-destructive sm:basis-full">{error}</p>}
    </form>
  )
}
