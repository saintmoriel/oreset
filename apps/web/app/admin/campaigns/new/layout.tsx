'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { CampaignProvider } from '@/components/admin/campaign-context'
import { StepProgress } from '@/components/shared/step-progress'

const WIZARD_STEPS = ['Name', 'Parameters', 'Pay Rate', 'Materials', 'Cohort', 'Launch'] as const
const STEP_PATHS = [
  '/admin/campaigns/new',
  '/admin/campaigns/new/parameters',
  '/admin/campaigns/new/pay-rate',
  '/admin/campaigns/new/materials',
  '/admin/campaigns/new/cohort',
  '/admin/campaigns/new/launch',
]

export default function NewCampaignLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const current = Math.max(0, STEP_PATHS.indexOf(pathname))

  return (
    <CampaignProvider>
      <div className="min-h-svh bg-background">
        <header className="border-b border-border/70 bg-card/80 backdrop-blur-md">
          <div className="container-narrow flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5" aria-label="Oreset home">
              <span className="flex size-8 overflow-hidden rounded-md bg-paper-200">
                <Image src="/oreset-logo.png" alt="" width={32} height={32} className="size-8" />
              </span>
              <span className="font-display text-lg font-semibold tracking-display">Oreset</span>
              <span className="ml-1 rounded-full bg-navy-800 px-2 py-0.5 text-caption font-semibold text-white">
                New Campaign
              </span>
            </Link>
            <Link
              href="/admin/campaigns?role=admin"
              className="inline-flex items-center gap-1.5 text-body-sm font-medium text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="size-4" />
              Cancel
            </Link>
          </div>
        </header>

        <div className="border-b border-border/70 bg-paper-100/60 py-4">
          <div className="container-narrow">
            <StepProgress steps={WIZARD_STEPS} current={current} />
          </div>
        </div>

        <main className="container-narrow py-12 sm:py-16">{children}</main>
      </div>
    </CampaignProvider>
  )
}
