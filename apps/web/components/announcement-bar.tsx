'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

export function AnnouncementBar() {
  const [visible, setVisible] = useState(true)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY < 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={reduceMotion ? false : { height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={reduceMotion ? undefined : { height: 0, opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="overflow-hidden bg-ink text-ink-foreground"
        >
          <div className="container-wide flex items-center justify-center gap-2 py-2.5 text-center">
            <span className="size-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
            <Link
              href="/operators/join"
              className="group inline-flex flex-wrap items-center justify-center gap-x-1.5 text-xs font-medium tracking-wide text-ink-foreground/90 transition-colors hover:text-white sm:text-sm"
            >
              <span>
                Oreset is accepting reviewer applications for African native language
                cohorts
              </span>
              <span className="inline-flex items-center gap-1 text-accent transition-transform group-hover:translate-x-0.5">
                Join
                <ArrowRight className="size-3.5" />
              </span>
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
