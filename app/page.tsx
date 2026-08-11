import { SiteNav } from '@/components/site-nav'
import { Hero } from '@/components/hero'
import { TrustStrip } from '@/components/trust-strip'
import { Problem } from '@/components/problem'
import { TwoArmsOverview } from '@/components/two-arms-overview'
import { OriginDeepDive } from '@/components/origin-deep-dive'
import { OperatorsDeepDive } from '@/components/operators-deep-dive'
import { TrustLedger } from '@/components/trust-ledger'
import { WhyNow } from '@/components/why-now'
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
        <TrustStrip />
        <Problem />
        <TwoArmsOverview />
        <OriginDeepDive />
        <OperatorsDeepDive />
        <TrustLedger />
        <WhyNow />
        <FAQ />
        <Contact />
      </main>
      <SiteFooter />
    </>
  )
}
