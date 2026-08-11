'use client'

import { type ReactNode } from 'react'
import { motion, type Variant } from 'framer-motion'

interface MotionRevealProps {
  children: ReactNode
  className?: string
  delay?: number
  direction?: 'up' | 'down' | 'left' | 'right' | 'none'
  distance?: number
  duration?: number
  once?: boolean
}

const directionOffset = (
  direction: MotionRevealProps['direction'],
  distance: number,
): { x?: number; y?: number } => {
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
  distance = 24,
  duration = 0.7,
  once = true,
}: MotionRevealProps) {
  const hidden: Variant = {
    opacity: 0,
    ...directionOffset(direction, distance),
  }
  const visible: Variant = {
    opacity: 1,
    x: 0,
    y: 0,
    transition: {
      duration,
      delay,
      ease: [0.22, 1, 0.36, 1],
    },
  }

  return (
    <motion.div
      className={className}
      initial={hidden}
      whileInView={visible}
      viewport={{ once, margin: '0px 0px -10% 0px' }}
    >
      {children}
    </motion.div>
  )
}

/* Stagger container — wrap children in MotionReveal for auto-stagger */
export function MotionStagger({
  children,
  className,
  stagger = 0.08,
}: {
  children: ReactNode
  className?: string
  stagger?: number
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: stagger } },
      }}
    >
      {children}
    </motion.div>
  )
}

export function MotionStaggerItem({
  children,
  className,
  direction = 'up',
  distance = 24,
}: {
  children: ReactNode
  className?: string
  direction?: 'up' | 'down' | 'left' | 'right' | 'none'
  distance?: number
}) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, ...directionOffset(direction, distance) },
        visible: {
          opacity: 1,
          x: 0,
          y: 0,
          transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
        },
      }}
    >
      {children}
    </motion.div>
  )
}
