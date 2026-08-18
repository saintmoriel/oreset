'use client'

import type { CSSProperties, ElementType, ReactNode } from 'react'
import { useReveal } from './use-reveal'
import { cn } from '@/lib/utils'

interface RevealProps {
  children: ReactNode
  className?: string
  delay?: number
  as?: ElementType
}

export function Reveal({ children, className, delay = 0, as: Tag = 'div' }: RevealProps) {
  const { ref, isVisible } = useReveal()

  return (
    <Tag
      ref={ref}
      className={cn('reveal', isVisible && 'is-visible', className)}
      style={{ '--reveal-delay': `${delay}ms` } as CSSProperties}
    >
      {children}
    </Tag>
  )
}
