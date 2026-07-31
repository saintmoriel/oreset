import { SiteNav } from '@/components/site-nav'
import { Hero } from '@/components/hero'
import { Problem } from '@/components/problem'
import { WhatWeBuild } from '@/components/what-we-build'
import { Contact } from '@/components/contact'
import { SiteFooter } from '@/components/site-footer'

export default function Page() {
  return (
    <>
      <SiteNav />
      <main>
        <Hero />
        <Problem />
        <WhatWeBuild />
        <Contact />
      </main>
      <SiteFooter />
    </>
  )
}
