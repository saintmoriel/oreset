import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Client Queue | Oreset Reviewers',
  description: 'Certified Reviewer prototype — reviewing a live enterprise client placement.',
}

export default function OperatorLayout({ children }: { children: React.ReactNode }) {
  return children
}
