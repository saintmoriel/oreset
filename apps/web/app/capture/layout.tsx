import type { Metadata } from 'next'
import { CaptureSessionProvider } from '@/components/capture/capture-session-context'

export const metadata: Metadata = {
  title: 'Recording Session | Oreset',
  description: 'Record, review, and submit a voice or photo contribution.',
}

export default function CaptureLayout({ children }: { children: React.ReactNode }) {
  return <CaptureSessionProvider>{children}</CaptureSessionProvider>
}
