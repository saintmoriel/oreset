'use client'

import { useRef, useEffect, useState } from 'react'
import { useInView, animate } from 'framer-motion'

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
  const isInView = useInView(ref, { once: true, margin: '0px 0px -10% 0px' })
  const [display, setDisplay] = useState('0')

  useEffect(() => {
    if (!isInView) return

    const controls = animate(0, target, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => {
        if (target >= 1_000_000) {
          setDisplay(`${(v / 1_000_000).toFixed(v >= target * 0.95 ? 0 : 1)}`)
        } else if (target >= 1000) {
          setDisplay(Math.round(v).toLocaleString())
        } else {
          setDisplay(Math.round(v).toString())
        }
      },
    })

    return () => controls.stop()
  }, [isInView, target, duration])

  return (
    <span ref={ref} className={className}>
      {prefix}{display}{suffix}
    </span>
  )
}
