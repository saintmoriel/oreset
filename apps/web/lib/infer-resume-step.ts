import type { PanelStep } from '@/components/capture/capture-panel'
import type { useCaptureSession } from '@/components/capture/capture-session-context'

// Sensible, not necessarily exact — enough to not drop a contributor back
// on a blank step if they wandered away mid-capture and came back.
export function inferResumeStep(session: ReturnType<typeof useCaptureSession>['session']): PanelStep {
  if (session.lastValidationResult) return 'validation'
  if (session.capturedBlob) return 'review'
  if (session.consentRecordId) return 'task'
  return 'consent'
}
