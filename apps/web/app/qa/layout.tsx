import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Origin QA | Oreset',
  description: 'Origin Quality Reviewer prototype — internal manual review of Oreset-collected data before packaging.',
}

export default function QaLayout({ children }: { children: React.ReactNode }) {
  return children
}
