'use client'

import { useState } from 'react'
import { Loader2, Lock } from 'lucide-react'

export function SecurityTab() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const mismatch = newPassword.length > 0 && confirmPassword.length > 0 && newPassword !== confirmPassword

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-5">
        <p className="text-sm font-semibold text-navy-900">Change Password</p>
        <p className="text-xs text-navy-400 mt-0.5">
          Update your password. You will need to sign in again after changing it.
        </p>

        <div className="mt-4 max-w-md space-y-4">
          <div>
            <label className="text-xs font-medium text-navy-600">Current password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none placeholder:text-navy-300 focus-visible:border-accent"
              placeholder="Enter current password"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-navy-600">New password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none placeholder:text-navy-300 focus-visible:border-accent"
              placeholder="Enter new password"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-navy-600">Confirm new password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none placeholder:text-navy-300 focus-visible:border-accent"
              placeholder="Re-enter new password"
            />
            {mismatch && <p className="mt-1 text-xs text-destructive">Passwords do not match.</p>}
          </div>

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          <div className="flex justify-end pt-2">
            <button
              type="button"
              disabled
              className="inline-flex items-center gap-2 rounded-md bg-navy-900 px-5 py-2.5 text-sm font-semibold text-white opacity-50 cursor-not-allowed"
              title="Password change will be available when the backend endpoint is ready"
            >
              <Lock className="size-4" />
              Update password
            </button>
          </div>
          <p className="text-[11px] text-navy-400">
            Password change is not yet available. Contact an administrator if you need to reset your password.
          </p>
        </div>
      </div>
    </div>
  )
}
