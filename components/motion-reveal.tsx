'use client'

import { useRef, type ReactNode } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, registerGsap, prefersReducedMotion, ScrollTrigger } from '@/lib/gsap'
import { cn } from '@/lib/utils'

registerGsap()

type Direction = 'up' | 'down' | 'left' | 'right' | 'none'

const offset = (direction: Direction, distance: number) => {
  switch (direction) {
    case 'up':
      return { y: distance }
    case 'down':
      return { y: -distance }
    case 'left':
      return { x: distance }
    case 'right':
      return { x: -distance }
    default:
      return {}
  }
}

export function MotionReveal({
  children,
  className,
  delay = 0,
  direction = 'up',
  distance = 28,
  duration = 0.85,
  once = true,
}: {
  children: ReactNode
  className?: string
  delay?: number
  direction?: Direction
  distance?: number
  duration?: number
  once?: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const el = ref.current
      if (!el) return

      if (prefersReducedMotion()) {
        gsap.set(el, { clearProps: 'all', autoAlpha: 1 })
        return
      }

      const isMobile = window.matchMedia('(max-width: 767px)').matches
      const dist = isMobile ? Math.min(distance, 18) : distance

      gsap.fromTo(
        el,
        { autoAlpha: 0, ...offset(direction, dist), force3D: true },
        {
          autoAlpha: 1,
          x: 0,
          y: 0,
          duration: isMobile ? Math.min(duration, 0.65) : duration,
          delay,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 92%',
            toggleActions: once ? 'play none none none' : 'play none none reverse',
          },
          onComplete: () => {
            gsap.set(el, { clearProps: 'transform' })
          },
        },
      )
    },
    { dependencies: [delay, direction, distance, duration, once], revertOnUpdate: true },
  )

  return (
    <div ref={ref} className={cn('invisible', className)}>
      {children}
    </div>
  )
}

export function MotionStagger({
  children,
  className,
  stagger = 0.07,
}: {
  children: ReactNode
  className?: string
  stagger?: number
}) {
  const ref = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const el = ref.current
      if (!el) return
      const items = el.querySelectorAll<HTMLElement>('[data-stagger-item]')

      if (prefersReducedMotion()) {
        gsap.set(items, { clearProps: 'all', autoAlpha: 1 })
        return
      }

      const isMobile = window.matchMedia('(max-width: 767px)').matches

      gsap.fromTo(
        items,
        { autoAlpha: 0, y: isMobile ? 16 : 28, force3D: true },
        {
          autoAlpha: 1,
          y: 0,
          duration: isMobile ? 0.55 : 0.8,
          stagger: isMobile ? Math.min(stagger, 0.05) : stagger,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 90%',
            toggleActions: 'play none none none',
          },
          onComplete: () => {
            gsap.set(items, { clearProps: 'transform' })
          },
        },
      )
    },
    { dependencies: [stagger], revertOnUpdate: true },
  )

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}

export function MotionStaggerItem({
  children,
  className,
}: {
  children: ReactNode
  className?: string
  direction?: Direction
  distance?: number
}) {
  return (
    <div data-stagger-item className={cn('invisible', className)}>
      {children}
    </div>
  )
}

export function refreshScrollTriggers() {
  ScrollTrigger.refresh()
}
