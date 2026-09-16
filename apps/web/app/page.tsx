import { SiteNav } from '@/components/site-nav'
import { Hero } from '@/components/hero'
import { Problem } from '@/components/problem'
import { WhatWeTest } from '@/components/what-we-test'
import { FindingShowcase } from '@/components/finding-showcase'
import { PlatformShowcase } from '@/components/platform-showcase'
import { HowItWorks } from '@/components/how-it-works'
import { QualityMethodology } from '@/components/quality-methodology'
import { FAQ } from '@/components/faq'
import { Contact } from '@/components/contact'
import { SiteFooter } from '@/components/site-footer'
import { ScrollOrchestrator } from '@/components/scroll-orchestrator'
import { SmoothScroll } from '@/components/smooth-scroll'
import { PilotScopingModal } from '@/components/pilot-scoping-modal'

// Eight blocks, one idea each. Company story and Why Now live at /company.
export default function Page() {
  return (
    <>
      <SmoothScroll />
      <ScrollOrchestrator />
      <SiteNav />
      <PilotScopingModal />
      <main>
        <Hero />
        <Problem />
        <WhatWeTest />
        <FindingShowcase />
        <PlatformShowcase />
        <HowItWorks />
        <QualityMethodology />
        <FAQ />
        <Contact />
      </main>
      <SiteFooter />
    </>
  )
}
