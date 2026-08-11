'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, registerGsap, prefersReducedMotion } from '@/lib/gsap'

registerGsap()

/** Desktop-only heavy scroll FX; mobile gets lighter fades for 60fps. */
export function ScrollOrchestrator() {
  const ran = useRef(false)

  useGSAP(() => {
    if (ran.current) return
    ran.current = true
    if (prefersReducedMotion()) return

    const mm = gsap.matchMedia()

    mm.add('(min-width: 768px)', () => {
      gsap.utils.toArray<HTMLElement>('[data-parallax]').forEach((el) => {
        const speed = Number(el.dataset.parallax || 0.15)
        gsap.to(el, {
          yPercent: speed * 100,
          ease: 'none',
          force3D: true,
          scrollTrigger: {
            trigger: el.parentElement || el,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.8,
          },
        })
      })

      gsap.utils.toArray<HTMLElement>('[data-scroll-section]').forEach((section) => {
        const media = section.querySelectorAll<HTMLElement>('[data-scroll-media]')
        const lines = section.querySelectorAll<HTMLElement>('[data-scroll-line]')

        if (media.length) {
          gsap.fromTo(
            media,
            { scale: 1.08 },
            {
              scale: 1,
              ease: 'none',
              force3D: true,
              scrollTrigger: {
                trigger: section,
                start: 'top 90%',
                end: 'top 35%',
                scrub: 0.7,
              },
            },
          )
        }

        if (lines.length) {
          gsap.fromTo(
            lines,
            { scaleX: 0, transformOrigin: 'left center' },
            {
              scaleX: 1,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: section,
                start: 'top 78%',
                end: 'top 45%',
                scrub: 0.45,
              },
            },
          )
        }
      })

      gsap.utils.toArray<HTMLElement>('[data-scroll-progress]').forEach((bar) => {
        gsap.fromTo(
          bar,
          { scaleX: 0, transformOrigin: 'left center' },
          {
            scaleX: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: bar.parentElement || bar,
              start: 'top 80%',
              end: 'bottom 45%',
              scrub: 0.5,
            },
          },
        )
      })
    })

    // Mobile: simple opacity reveals only (orchestrator media/parallax skipped)
    mm.add('(max-width: 767px)', () => {
      gsap.utils.toArray<HTMLElement>('[data-scroll-line]').forEach((line) => {
        gsap.fromTo(
          line,
          { scaleX: 0, transformOrigin: 'left center' },
          {
            scaleX: 1,
            duration: 0.7,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: line,
              start: 'top 90%',
              toggleActions: 'play none none none',
            },
          },
        )
      })
    })

    return () => mm.revert()
  }, [])

  return null
}
