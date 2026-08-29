'use client'

import { useEffect, useState } from 'react'
import { Loader2, Save, Lock, Landmark, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ApiError } from '@/lib/api/client'
import {
  getPayoutDetails,
  updatePayoutDetails,
  type PayoutDetails,
} from '@/lib/api/endpoints/operator'

const COUNTRIES = [
  'Nigeria',
  'Ghana',
  'Kenya',
  'South Africa',
  'Tanzania',
  'Uganda',
  'Ethiopia',
  'Rwanda',
  'Senegal',
  'Cameroon',
]

export function PayoutsTab() {
  const [payoutDetails, setPayoutDetails] = useState<PayoutDetails>(null)
  const [identityVerified, setIdentityVerified] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [country, setCountry] = useState('')
  const [bankName, setBankName] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [accountName, setAccountName] = useState('')

  useEffect(() => {
    getPayoutDetails()
      .then((res) => {
        setPayoutDetails(res.payoutDetails)
        setIdentityVerified(res.identityVerified)
        if (res.payoutDetails) {
          setCountry(res.payoutDetails.country)
          setBankName(res.payoutDetails.bankName)
          setAccountNumber(res.payoutDetails.accountNumber)
          setAccountName(res.payoutDetails.accountName)
        }
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Could not load payout details.'))
      .finally(() => setLoading(false))
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!identityVerified) return

    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const res = await updatePayoutDetails({
        country: country.trim(),
        bankName: bankName.trim(),
        accountNumber: accountNumber.trim(),
        accountName: accountName.trim(),
      })
      setPayoutDetails(res.payoutDetails)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not save bank details.')
    } finally {
      setSaving(false)
    }
  }

  const canSave =
    identityVerified &&
    country.trim() &&
    bankName.trim() &&
    accountNumber.trim() &&
    accountName.trim()

  if (loading) {
    return (
      <div className="flex justify-center p-16">
        <Loader2 className="size-8 animate-spin text-accent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Identity gate */}
      {!identityVerified && (
        <div className="rounded-xl border border-warning/30 bg-warning/5 p-5">
          <div className="flex items-start gap-3">
            <Lock className="size-5 mt-0.5 shrink-0 text-warning" />
            <div>
              <p className="text-sm font-semibold text-navy-900">Identity verification required</p>
              <p className="text-xs text-navy-500 mt-1">
                Complete identity verification in the Verification tab before adding bank details.
                This protects both you and Oreset from payout fraud.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Bank Details Form */}
      <div className={cn('rounded-xl border border-border bg-card p-5', !identityVerified && 'opacity-60')}>
        <div className="flex items-center gap-2">
          <Landmark className="size-4 text-navy-600" />
          <p className="text-sm font-semibold text-navy-900">Bank Details</p>
        </div>
        <p className="text-xs text-navy-400 mt-0.5">
          The account where your earnings will be paid out. The account name must match your profile and ID.
        </p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-medium text-navy-600">Country</label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                disabled={!identityVerified}
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-navy-700 outline-none focus-visible:border-accent disabled:bg-navy-50 disabled:cursor-not-allowed"
              >
                <option value="">Select country</option>
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-navy-600">Bank</label>
              <input
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                disabled={!identityVerified}
                placeholder="e.g. GTBank, Access Bank"
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-navy-900 outline-none placeholder:text-navy-300 focus-visible:border-accent disabled:bg-navy-50 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-navy-600">Account number</label>
              <input
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                disabled={!identityVerified}
                placeholder="0123456789"
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm font-mono text-navy-900 outline-none placeholder:text-navy-300 focus-visible:border-accent disabled:bg-navy-50 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-navy-600">Account name</label>
              <input
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                disabled={!identityVerified}
                placeholder="As it appears on your bank account"
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-navy-900 outline-none placeholder:text-navy-300 focus-visible:border-accent disabled:bg-navy-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          {!identityVerified && (
            <p className="text-[11px] text-navy-400 flex items-center gap-1.5">
              <AlertTriangle className="size-3 text-warning" />
              Mismatches between your ID name and bank account name will delay verification.
            </p>
          )}

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
          {success && <p className="text-sm text-success">Bank details saved successfully.</p>}

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={!canSave || saving}
              className="inline-flex items-center gap-2 rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              {saving ? 'Saving...' : 'Save bank details'}
            </button>
          </div>
        </form>
      </div>

      {/* Earnings Summary — placeholder for when payout history is available */}
      <div className="rounded-xl border border-border bg-card p-5">
        <p className="text-sm font-semibold text-navy-900">Earnings</p>
        <p className="text-xs text-navy-400 mt-0.5">
          Your review earnings and payout history will appear here once cases are assigned to you.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-border bg-background p-4">
            <p className="text-[11px] font-medium uppercase tracking-wider text-navy-400">Total earned</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-navy-900">$0.00</p>
          </div>
          <div className="rounded-lg border border-border bg-background p-4">
            <p className="text-[11px] font-medium uppercase tracking-wider text-navy-400">Pending payout</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-navy-900">$0.00</p>
          </div>
          <div className="rounded-lg border border-border bg-background p-4">
            <p className="text-[11px] font-medium uppercase tracking-wider text-navy-400">Cases reviewed</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-navy-900">0</p>
          </div>
        </div>

        <p className="text-[11px] text-navy-400 mt-3">
          Payouts are processed monthly. Minimum payout threshold: $10.00.
        </p>
      </div>
    </div>
  )
}
