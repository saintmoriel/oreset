'use client'

import { useEffect } from 'react'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import { gsap, registerGsap, prefersReducedMotion, ScrollTrigger } from '@/lib/gsap'

registerGsap()

/**
 * Buttery smooth scrolling via Lenis, synced to GSAP ScrollTrigger.
 * Disabled when the user prefers reduced motion.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (prefersReducedMotion()) return

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.35,
      wheelMultiplier: 0.92,
      autoRaf: false,
    })

    lenis.on('scroll', ScrollTrigger.update)

    const ticker = (time: number) => {
      lenis.raf(time * 1000)
    }
    gsap.ticker.add(ticker)
    gsap.ticker.lagSmoothing(0)

    const onLoad = () => ScrollTrigger.refresh()
    window.addEventListener('load', onLoad)

    let resizeTimer: ReturnType<typeof setTimeout>
    const onResize = () => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(() => ScrollTrigger.refresh(), 150)
    }
    window.addEventListener('resize', onResize, { passive: true })

    document.documentElement.classList.add('lenis')

    const onClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest(
        'a[href^="#"]',
      ) as HTMLAnchorElement | null
      if (!target) return
      const hash = target.getAttribute('href')
      if (!hash || hash === '#') return
      const el = document.querySelector(hash)
      if (!el) return
      e.preventDefault()
      lenis.scrollTo(el as HTMLElement, { offset: -72, duration: 1.2 })
    }
    document.addEventListener('click', onClick)

    const stop = () => lenis.stop()
    const start = () => lenis.start()
    window.addEventListener('oreset:scroll-stop', stop)
    window.addEventListener('oreset:scroll-start', start)

    return () => {
      gsap.ticker.remove(ticker)
      lenis.destroy()
      window.removeEventListener('load', onLoad)
      window.removeEventListener('resize', onResize)
      document.removeEventListener('click', onClick)
      window.removeEventListener('oreset:scroll-stop', stop)
      window.removeEventListener('oreset:scroll-start', start)
      clearTimeout(resizeTimer)
      document.documentElement.classList.remove('lenis')
    }
  }, [])

  return null
}
