'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'
import type { MediaType, ValidationOutcome } from '@oreset/shared'

export type CaptureValidationResult = {
  outcome: ValidationOutcome
  reason: string | null
  score: number
}

export type GeoLocation = { lat: number; lng: number; accuracy?: number }

type CaptureSession = {
  batchId: string | null
  batchItemCount: number | null
  mediaType: MediaType | null
  consentRecordId: string | null
  capturedBlob: Blob | null
  capturedAt: string | null // ISO
  durationSeconds: number | null // audio only
  imageMetadata: Record<string, unknown> | null
  deviceInfo: Record<string, unknown> | null
  geoLocation: GeoLocation | null
  lastValidationResult: CaptureValidationResult | null
  lastSubmissionId: string | null
  retake: boolean
  submittedCount: number
}

const DEFAULT_SESSION: CaptureSession = {
  batchId: null,
  batchItemCount: null,
  mediaType: null,
  consentRecordId: null,
  capturedBlob: null,
  capturedAt: null,
  durationSeconds: null,
  imageMetadata: null,
  deviceInfo: null,
  geoLocation: null,
  lastValidationResult: null,
  lastSubmissionId: null,
  retake: false,
  submittedCount: 0,
}

// Fields cleared between items within the same batch — batchId, mediaType,
// consentRecordId, and submittedCount all still apply to the next item.
const PER_ITEM_FIELDS: Partial<CaptureSession> = {
  capturedBlob: null,
  capturedAt: null,
  durationSeconds: null,
  imageMetadata: null,
  deviceInfo: null,
  geoLocation: null,
  lastValidationResult: null,
  lastSubmissionId: null,
  retake: false,
}

const CaptureSessionContext = createContext<{
  session: CaptureSession
  update: (patch: Partial<CaptureSession>) => void
  resetItem: () => void
  reset: () => void
} | null>(null)

export function CaptureSessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<CaptureSession>(DEFAULT_SESSION)

  function update(patch: Partial<CaptureSession>) {
    setSession((s) => ({ ...s, ...patch }))
  }

  function resetItem() {
    setSession((s) => ({ ...s, ...PER_ITEM_FIELDS }))
  }

  function reset() {
    setSession(DEFAULT_SESSION)
  }

  return (
    <CaptureSessionContext.Provider value={{ session, update, resetItem, reset }}>
      {children}
    </CaptureSessionContext.Provider>
  )
}

export function useCaptureSession() {
  const ctx = useContext(CaptureSessionContext)
  if (!ctx) throw new Error('useCaptureSession must be used within CaptureSessionProvider')
  return ctx
}
