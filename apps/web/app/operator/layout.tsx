import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Red Team | Oreset',
  description: 'Oreset Red Team workspace for assessing attack scenarios against client AI agents.',
}

export default function OperatorLayout({ children }: { children: React.ReactNode }) {
  return children
}
