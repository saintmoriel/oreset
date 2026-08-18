export type MediaType = 'audio' | 'image'
export type BatchStatus = 'available' | 'under_review' | 'approved' | 'paid' | 'rejected'

export type Batch = {
  id: string
  type: MediaType
  title: string
  itemCount: number
  rate: string
  status: BatchStatus
  submittedAt?: string
  brief?: string
  guidelines?: string[]
  permissions?: string[]
}

export const BATCHES: Batch[] = [
  {
    id: 'batch-yo-014',
    type: 'audio',
    title: 'Yorùbá read-speech batch',
    itemCount: 5,
    rate: '₦2,500',
    status: 'available',
    brief:
      'Read short Yorùbá sentences aloud in a quiet space. Each take is scored for clarity, pronunciation, and background noise.',
    guidelines: [
      'Record somewhere quiet — avoid traffic, fans, or background chatter',
      'Speak at a natural, conversational pace',
      'Read the full sentence — don’t paraphrase or restart mid-sentence',
    ],
    permissions: ['Microphone access'],
  },
  {
    id: 'batch-cv-021',
    type: 'image',
    title: 'Crop & Pest Photo Capture — Kaduna pilot',
    itemCount: 5,
    rate: '₦1,800',
    status: 'available',
    brief:
      'Photograph crop leaves and flag visible pest or disease damage for an agricultural vision pilot.',
    guidelines: [
      'Capture the full leaf or affected area in frame, in daylight',
      'Avoid heavy shadows, glare, or motion blur',
      'Tag the visible category before submitting',
    ],
    permissions: ['Camera access', 'Location access'],
  },
  {
    id: 'batch-yo-009',
    type: 'audio',
    title: 'Yorùbá read-speech batch',
    itemCount: 5,
    rate: '₦2,500',
    status: 'under_review',
    submittedAt: '2026-08-15',
  },
  {
    id: 'batch-yo-006',
    type: 'audio',
    title: 'Yorùbá read-speech batch',
    itemCount: 5,
    rate: '₦2,500',
    status: 'approved',
    submittedAt: '2026-08-10',
  },
  {
    id: 'batch-yo-002',
    type: 'audio',
    title: 'Yorùbá read-speech batch',
    itemCount: 5,
    rate: '₦2,500',
    status: 'paid',
    submittedAt: '2026-08-03',
  },
  {
    id: 'batch-yo-001',
    type: 'audio',
    title: 'Yorùbá read-speech batch',
    itemCount: 5,
    rate: '₦2,000',
    status: 'rejected',
    submittedAt: '2026-07-29',
  },
]

export const STATUS_LABEL: Record<BatchStatus, string> = {
  available: 'Available now',
  under_review: 'Under review',
  approved: 'Approved · payout pending',
  paid: 'Paid',
  rejected: 'Rejected',
}

export const TOTAL_PAID = '₦4,500'
