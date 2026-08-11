'use client'

import { useMemo, useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, registerGsap, prefersReducedMotion } from '@/lib/gsap'

registerGsap()

/** Word-by-word scrub highlight — lighter on mobile */
export function ScrollWords({
  text,
  className,
}: {
  text: string
  className?: string
}) {
  const ref = useRef<HTMLParagraphElement>(null)
  const words = useMemo(() => text.split(' '), [text])

  useGSAP(
    () => {
      const el = ref.current
      if (!el) return
      const spans = el.querySelectorAll<HTMLElement>('[data-word]')

      if (prefersReducedMotion()) {
        gsap.set(spans, { autoAlpha: 1, y: 0, color: 'var(--foreground)' })
        return
      }

      const isMobile = window.matchMedia('(max-width: 767px)').matches

      gsap.set(spans, { autoAlpha: 0.2, y: isMobile ? 6 : 10 })

      gsap.to(spans, {
        autoAlpha: 1,
        y: 0,
        color: 'var(--foreground)',
        stagger: isMobile ? 0.03 : 0.045,
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          end: isMobile ? 'bottom 55%' : 'bottom 35%',
          scrub: isMobile ? 0.4 : 0.75,
        },
      })
    },
    { dependencies: [text], revertOnUpdate: true },
  )

  return (
    <p ref={ref} className={className}>
      {words.map((word, i) => (
        <span key={`${word}-${i}`} className="inline-block">
          <span data-word className="inline-block will-change-transform">
            {word}
          </span>
          {i < words.length - 1 ? '\u00A0' : null}
        </span>
      ))}
    </p>
  )
}
