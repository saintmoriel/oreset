import { CheckCircle2, Clock, XCircle, type LucideIcon } from 'lucide-react'
import type { SubmissionStatus } from '@oreset/shared'

export const SUBMISSION_STATUS_META: Record<
  SubmissionStatus,
  { icon: LucideIcon; label: string; tone: 'success' | 'warning' | 'destructive' | 'neutral' }
> = {
  submitted: { icon: XCircle, label: 'Flagged', tone: 'destructive' },
  validated: { icon: Clock, label: 'Awaiting review', tone: 'neutral' },
  qa_approved: { icon: CheckCircle2, label: 'Approved', tone: 'success' },
  qa_rejected: { icon: XCircle, label: 'Rejected', tone: 'destructive' },
}
