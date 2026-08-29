'use client'

import { useEffect, useState, useRef } from 'react'
import {
  Loader2,
  Upload,
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  ShieldCheck,
  Trash2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ApiError } from '@/lib/api/client'
import {
  getVerifications,
  submitVerification,
  type IdentityVerification,
  type DocumentType,
  type OverallVerificationStatus,
} from '@/lib/api/endpoints/operator'

const DOCUMENT_TYPES: { value: DocumentType; label: string; description: string; required: boolean }[] = [
  {
    value: 'government_id',
    label: 'Government ID',
    description: 'National ID card, international passport, or driver\'s license',
    required: true,
  },
  {
    value: 'education_certificate',
    label: 'Education Certificate',
    description: 'Highest educational qualification certificate',
    required: true,
  },
  {
    value: 'resume',
    label: 'Resume / CV',
    description: 'Your current resume or curriculum vitae',
    required: false,
  },
  {
    value: 'other',
    label: 'Other Document',
    description: 'Any additional supporting document',
    required: false,
  },
]

const STATUS_CONFIG: Record<
  OverallVerificationStatus,
  { icon: typeof CheckCircle2; label: string; color: string; bg: string; description: string }
> = {
  incomplete: {
    icon: AlertTriangle,
    label: 'Incomplete',
    color: 'text-navy-500',
    bg: 'bg-navy-100',
    description: 'Upload the required documents to begin verification.',
  },
  pending: {
    icon: Clock,
    label: 'Under Review',
    color: 'text-warning',
    bg: 'bg-warning/10',
    description: 'Your documents are being reviewed. This typically takes 1-3 business days.',
  },
  verified: {
    icon: ShieldCheck,
    label: 'Verified',
    color: 'text-success',
    bg: 'bg-success/10',
    description: 'Your identity has been verified. You can be assigned review cases.',
  },
  rejected: {
    icon: XCircle,
    label: 'Rejected',
    color: 'text-destructive',
    bg: 'bg-destructive/10',
    description: 'One or more documents were rejected. Please re-upload corrected versions.',
  },
}

const DOC_STATUS_ICON: Record<string, { icon: typeof CheckCircle2; color: string }> = {
  pending: { icon: Clock, color: 'text-warning' },
  approved: { icon: CheckCircle2, color: 'text-success' },
  rejected: { icon: XCircle, color: 'text-destructive' },
}

function formatFileSize(bytes: string | null) {
  if (!bytes) return ''
  const n = parseInt(bytes, 10)
  if (isNaN(n)) return ''
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / (1024 * 1024)).toFixed(1)} MB`
}

export function VerificationTab() {
  const [verifications, setVerifications] = useState<IdentityVerification[]>([])
  const [overallStatus, setOverallStatus] = useState<OverallVerificationStatus>('incomplete')
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState<DocumentType | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [pendingDocType, setPendingDocType] = useState<DocumentType | null>(null)

  useEffect(() => {
    getVerifications()
      .then((res) => {
        setVerifications(res.verifications)
        setOverallStatus(res.overallStatus)
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Could not load verifications.'))
      .finally(() => setLoading(false))
  }, [])

  function getDocForType(type: DocumentType) {
    return verifications.find((v) => v.documentType === type)
  }

  function triggerUpload(docType: DocumentType) {
    setPendingDocType(docType)
    fileInputRef.current?.click()
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !pendingDocType) return
    e.target.value = ''

    setUploading(pendingDocType)
    setError(null)

    try {
      const fileUrl = `local://${pendingDocType}/${file.name}`
      const result = await submitVerification({
        documentType: pendingDocType,
        fileName: file.name,
        fileUrl,
        fileSizeBytes: String(file.size),
      })
      setVerifications((prev) => {
        const filtered = prev.filter((v) => v.documentType !== pendingDocType)
        return [result, ...filtered]
      })
      setOverallStatus('pending')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Upload failed. Please try again.')
    } finally {
      setUploading(null)
      setPendingDocType(null)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center p-16">
        <Loader2 className="size-8 animate-spin text-accent" />
      </div>
    )
  }

  const statusConfig = STATUS_CONFIG[overallStatus]
  const StatusIcon = statusConfig.icon

  return (
    <div className="space-y-6">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
        onChange={handleFileSelect}
      />

      {/* Overall Status Banner */}
      <div className={cn('rounded-xl border border-border p-5', statusConfig.bg)}>
        <div className="flex items-start gap-3">
          <StatusIcon className={cn('size-5 mt-0.5 shrink-0', statusConfig.color)} />
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-navy-900">Identity Verification</p>
              <span
                className={cn(
                  'rounded-full px-2.5 py-0.5 text-[11px] font-semibold',
                  statusConfig.bg,
                  statusConfig.color,
                )}
              >
                {statusConfig.label}
              </span>
            </div>
            <p className="text-xs text-navy-500 mt-1">{statusConfig.description}</p>
          </div>
        </div>
      </div>

      {/* Required Documents */}
      <div className="rounded-xl border border-border bg-card p-5">
        <p className="text-sm font-semibold text-navy-900">Required Documents</p>
        <p className="text-xs text-navy-400 mt-0.5">
          The name on your ID must match your profile, bank account, and educational certificate.
        </p>

        <div className="mt-4 space-y-3">
          {DOCUMENT_TYPES.filter((d) => d.required).map((docType) => {
            const existing = getDocForType(docType.value)
            const isUploading = uploading === docType.value
            const docStatus = existing ? DOC_STATUS_ICON[existing.status] : null
            const DocStatusIcon = docStatus?.icon

            return (
              <div key={docType.value} className="rounded-lg border border-border bg-background p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <FileText className="size-5 shrink-0 text-navy-400 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-navy-900">{docType.label}</p>
                      <p className="text-xs text-navy-400 mt-0.5">{docType.description}</p>
                      {existing && (
                        <div className="mt-2 flex items-center gap-2">
                          {DocStatusIcon && (
                            <DocStatusIcon className={cn('size-3.5', docStatus?.color)} />
                          )}
                          <span className="text-xs text-navy-600 truncate">{existing.fileName}</span>
                          {existing.fileSizeBytes && (
                            <span className="text-[11px] text-navy-400">
                              ({formatFileSize(existing.fileSizeBytes)})
                            </span>
                          )}
                        </div>
                      )}
                      {existing?.status === 'rejected' && existing.reviewNotes && (
                        <p className="mt-1.5 text-xs text-destructive">
                          Reason: {existing.reviewNotes}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => triggerUpload(docType.value)}
                    disabled={isUploading || (existing?.status === 'approved')}
                    className={cn(
                      'shrink-0 inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors',
                      existing?.status === 'approved'
                        ? 'border-success/30 text-success cursor-not-allowed'
                        : existing
                          ? 'border-warning/30 text-warning hover:bg-warning/10'
                          : 'border-accent/30 text-accent hover:bg-accent/10',
                    )}
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="size-3 animate-spin" />
                        Uploading...
                      </>
                    ) : existing?.status === 'approved' ? (
                      <>
                        <CheckCircle2 className="size-3" />
                        Verified
                      </>
                    ) : existing ? (
                      <>
                        <Upload className="size-3" />
                        Re-upload
                      </>
                    ) : (
                      <>
                        <Upload className="size-3" />
                        Upload
                      </>
                    )}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Optional Documents */}
      <div className="rounded-xl border border-border bg-card p-5">
        <p className="text-sm font-semibold text-navy-900">Supporting Documents</p>
        <p className="text-xs text-navy-400 mt-0.5">
          Optional documents that strengthen your profile.
        </p>

        <div className="mt-4 space-y-3">
          {DOCUMENT_TYPES.filter((d) => !d.required).map((docType) => {
            const existing = getDocForType(docType.value)
            const isUploading = uploading === docType.value
            const docStatus = existing ? DOC_STATUS_ICON[existing.status] : null
            const DocStatusIcon = docStatus?.icon

            return (
              <div key={docType.value} className="rounded-lg border border-border bg-background p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <FileText className="size-5 shrink-0 text-navy-400 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-navy-900">
                        {docType.label}
                        <span className="ml-1.5 text-[11px] font-normal text-navy-400">Optional</span>
                      </p>
                      <p className="text-xs text-navy-400 mt-0.5">{docType.description}</p>
                      {existing && (
                        <div className="mt-2 flex items-center gap-2">
                          {DocStatusIcon && (
                            <DocStatusIcon className={cn('size-3.5', docStatus?.color)} />
                          )}
                          <span className="text-xs text-navy-600 truncate">{existing.fileName}</span>
                          {existing.fileSizeBytes && (
                            <span className="text-[11px] text-navy-400">
                              ({formatFileSize(existing.fileSizeBytes)})
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => triggerUpload(docType.value)}
                    disabled={isUploading || (existing?.status === 'approved')}
                    className={cn(
                      'shrink-0 inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors',
                      existing?.status === 'approved'
                        ? 'border-success/30 text-success cursor-not-allowed'
                        : existing
                          ? 'border-warning/30 text-warning hover:bg-warning/10'
                          : 'border-border text-navy-500 hover:bg-navy-50',
                    )}
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="size-3 animate-spin" />
                        Uploading...
                      </>
                    ) : existing?.status === 'approved' ? (
                      <>
                        <CheckCircle2 className="size-3" />
                        Verified
                      </>
                    ) : existing ? (
                      <>
                        <Upload className="size-3" />
                        Re-upload
                      </>
                    ) : (
                      <>
                        <Upload className="size-3" />
                        Upload
                      </>
                    )}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <p className="text-[11px] text-navy-400">
        Uploaded documents are reviewed by the Oreset team. You will be notified once verification is complete.
        Accepted formats: PDF, JPG, PNG, DOC. Maximum file size: 10MB.
      </p>
    </div>
  )
}
