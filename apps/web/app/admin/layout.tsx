import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin | Oreset',
  description: 'Oreset admin dashboard: pipeline overview, calibration, and audit log.',
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children
}
