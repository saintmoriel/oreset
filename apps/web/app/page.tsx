import { SiteNav } from '@/components/site-nav'
import { Hero } from '@/components/hero'
import { Problem } from '@/components/problem'
import { WhatWeTest } from '@/components/what-we-test'
import { HowItWorks } from '@/components/how-it-works'
import { QualityMethodology } from '@/components/quality-methodology'
import { WhyNow } from '@/components/why-now'
import { AboutSection } from '@/components/about-section'
import { FAQ } from '@/components/faq'
import { Contact } from '@/components/contact'
import { SiteFooter } from '@/components/site-footer'
import { ScrollOrchestrator } from '@/components/scroll-orchestrator'
import { SmoothScroll } from '@/components/smooth-scroll'
import { PilotScopingModal } from '@/components/pilot-scoping-modal'

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
        <HowItWorks />
        <QualityMethodology />
        <WhyNow />
        <AboutSection />
        <FAQ />
        <Contact />
      </main>
      <SiteFooter />
    </>
  )
}
