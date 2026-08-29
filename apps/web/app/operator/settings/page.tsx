'use client'

import { useEffect, useState } from 'react'
import { Loader2, User, Shield, BadgeCheck } from 'lucide-react'
import { OperatorAppShell } from '@/components/operator/operator-app-shell'
import { ProfileTab } from '@/components/operator/settings/profile-tab'
import { SecurityTab } from '@/components/operator/settings/security-tab'
import { VerificationTab } from '@/components/operator/settings/verification-tab'
import {
  getOperatorProfile,
  updateOperatorProfile,
  type OperatorProfile,
  type ProfileUpdateInput,
} from '@/lib/api/endpoints/operator'
import { ApiError } from '@/lib/api/client'
import { cn } from '@/lib/utils'

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'verification', label: 'Verification', icon: BadgeCheck },
  { id: 'security', label: 'Security', icon: Shield },
] as const

type TabId = (typeof TABS)[number]['id']

export default function OperatorSettingsPage() {
  const [profile, setProfile] = useState<OperatorProfile | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabId>('profile')

  useEffect(() => {
    getOperatorProfile()
      .then(setProfile)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Could not load profile.'))
  }, [])

  async function handleSave(data: ProfileUpdateInput) {
    const updated = await updateOperatorProfile(data)
    setProfile(updated)
  }

  if (error && !profile) {
    return (
      <OperatorAppShell>
        <p className="cx-body text-destructive">{error}</p>
      </OperatorAppShell>
    )
  }

  if (!profile) {
    return (
      <OperatorAppShell>
        <div className="flex justify-center p-16">
          <Loader2 className="size-8 animate-spin text-accent" />
        </div>
      </OperatorAppShell>
    )
  }

  return (
    <OperatorAppShell>
      <h1 className="cx-page-title text-navy-900">Settings</h1>
      <p className="cx-body mt-1 text-navy-400">Manage your reviewer profile, verification, and security.</p>

      {/* Tabs */}
      <div className="mt-6 flex gap-1 rounded-lg border border-border bg-navy-50 p-1 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors',
              activeTab === tab.id
                ? 'bg-background text-navy-900 shadow-sm'
                : 'text-navy-500 hover:text-navy-700',
            )}
          >
            <tab.icon className="size-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {activeTab === 'profile' && <ProfileTab profile={profile} onSave={handleSave} />}
        {activeTab === 'verification' && <VerificationTab />}
        {activeTab === 'security' && <SecurityTab />}
      </div>
    </OperatorAppShell>
  )
}
