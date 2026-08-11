import { SiteNav } from '@/components/site-nav'
import { Hero } from '@/components/hero'
import { ScrollNarrative } from '@/components/scroll-narrative'
import { StatsSection } from '@/components/stats-section'
import { LanguageMarquee } from '@/components/language-marquee'
import { NetworkSection } from '@/components/network-section'
import { VisualSpotlight } from '@/components/visual-spotlight'
import { TrustLedger } from '@/components/trust-ledger'
import { Contact } from '@/components/contact'
import { SiteFooter } from '@/components/site-footer'

export default function Page() {
  return (
    <>
      <SiteNav />
      <main>
        <Hero />
        <ScrollNarrative />
        <StatsSection />
        <LanguageMarquee />
        <NetworkSection />
        <VisualSpotlight />
        <TrustLedger />
        <Contact />
      </main>
      <SiteFooter />
    </>
  )
}
