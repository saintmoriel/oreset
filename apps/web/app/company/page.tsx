'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { SiteNav } from '@/components/site-nav'
import { SiteFooter } from '@/components/site-footer'
import { SmoothScroll } from '@/components/smooth-scroll'
import { ScrollOrchestrator } from '@/components/scroll-orchestrator'
import { AboutSection } from '@/components/about-section'
import { WhyNow } from '@/components/why-now'
import { Contact } from '@/components/contact'
import { PilotScopingModal } from '@/components/pilot-scoping-modal'

export default function CompanyPage() {
  return (
    <>
      <SmoothScroll />
      <ScrollOrchestrator />
      <SiteNav />
      <PilotScopingModal />
      <main className="min-h-svh bg-background pt-24 sm:pt-28 md:pt-32">
        <div className="container-wide">
          <Link href="/" className="inline-flex items-center gap-1.5 text-body-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            <ArrowLeft className="size-3.5" />
            Back to home
          </Link>
        </div>
        <AboutSection />
        <WhyNow />
        <Contact />
      </main>
      <SiteFooter />
    </>
  )
}
