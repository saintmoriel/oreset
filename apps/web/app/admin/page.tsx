'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { ROLES } from '@/lib/admin-mock-data'

export default function AdminSignInPage() {
  return (
    <div className="min-h-svh bg-background">
      <header className="border-b border-border/70 bg-card/80 backdrop-blur-md">
        <div className="container-narrow flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5" aria-label="Oreset home">
            <span className="flex size-8 overflow-hidden rounded-md bg-paper-200">
              <Image src="/oreset-logo.png" alt="" width={32} height={32} className="size-8" />
            </span>
            <span className="font-display text-lg font-semibold tracking-display">Oreset</span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-body-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Back to site
          </Link>
        </div>
      </header>

      <main className="container-narrow py-16 sm:py-24">
        <p className="text-eyebrow text-accent">Admin · RBAC</p>
        <h1 className="text-h1 mt-3 text-balance text-foreground">Choose a role to preview</h1>
        <p className="text-body mt-3 text-pretty text-muted-foreground">
          This demo swaps the dashboard&apos;s available views by role. In production, role is
          assigned server-side and enforced on every request.
        </p>

        <div className="mt-8 space-y-3">
          {ROLES.map((role) => (
            <Link
              key={role.id}
              href={`/admin/dashboard?role=${role.id}`}
              className="card-surface flex items-center justify-between gap-4 p-5 hover:border-accent/40"
            >
              <div>
                <p className="text-body font-semibold text-foreground">{role.label}</p>
                <p className="text-body-sm mt-1 text-muted-foreground">{role.description}</p>
              </div>
              <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
