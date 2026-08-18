'use client'

import { useRef, useEffect, useState } from 'react'
import { useInView, animate, useReducedMotion } from 'framer-motion'

interface AnimatedCounterProps {
  target: number
  suffix?: string
  prefix?: string
  duration?: number
  className?: string
}

export function AnimatedCounter({
  target,
  suffix = '',
  prefix = '',
  duration = 2,
  className,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const reduceMotion = useReducedMotion()
  const isInView = useInView(ref, { once: true, margin: '0px 0px -10% 0px' })
  const [display, setDisplay] = useState(() =>
    reduceMotion ? formatNumber(target) : '0',
  )

  useEffect(() => {
    if (reduceMotion) {
      setDisplay(formatNumber(target))
      return
    }
    if (!isInView) return

    const controls = animate(0, target, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(formatNumber(Math.round(v))),
    })

    return () => controls.stop()
  }, [isInView, target, duration, reduceMotion])

  return (
    <span ref={ref} className={className}>
      {prefix}
      {display}
      {suffix}
    </span>
  )
}

function formatNumber(n: number) {
  return n.toLocaleString('en-US')
}
