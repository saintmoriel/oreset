'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { logout } from '@/lib/api/endpoints/auth'

export function SignOutButton({ signInPath, className }: { signInPath: string; className?: string }) {
  const router = useRouter()

  async function onSignOut() {
    try {
      await logout()
    } finally {
      router.push(signInPath)
    }
  }

  return (
    <button onClick={onSignOut} className={className}>
      <ArrowLeft className="size-4" />
      Sign out
    </button>
  )
}
