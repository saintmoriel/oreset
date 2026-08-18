import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Recording Session | Oreset',
  description: 'Contributor capture flow prototype — consent, record, review, and submit a voice prompt.',
}

export default function CaptureLayout({ children }: { children: React.ReactNode }) {
  return children
}
