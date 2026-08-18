'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'

type CampaignDraft = {
  name: string
  language: string
  domain: string
  batchSize: string
  mediaType: string
  payRate: string
  materialsUploaded: boolean
  cohort: string
}

const DEFAULT_DRAFT: CampaignDraft = {
  name: '',
  language: '',
  domain: '',
  batchSize: '',
  mediaType: '',
  payRate: '',
  materialsUploaded: false,
  cohort: '',
}

const CampaignContext = createContext<{
  draft: CampaignDraft
  update: (patch: Partial<CampaignDraft>) => void
  reset: () => void
} | null>(null)

export function CampaignProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<CampaignDraft>(DEFAULT_DRAFT)

  function update(patch: Partial<CampaignDraft>) {
    setDraft((d) => ({ ...d, ...patch }))
  }

  function reset() {
    setDraft(DEFAULT_DRAFT)
  }

  return <CampaignContext.Provider value={{ draft, update, reset }}>{children}</CampaignContext.Provider>
}

export function useCampaignDraft() {
  const ctx = useContext(CampaignContext)
  if (!ctx) throw new Error('useCampaignDraft must be used within CampaignProvider')
  return ctx
}
