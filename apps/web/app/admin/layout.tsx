import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin | Oreset',
  description: 'Admin/RBAC dashboard prototype — pipeline overview and audit log.',
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children
}
