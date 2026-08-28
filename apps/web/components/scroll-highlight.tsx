'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

interface ScrollHighlightProps {
  text: string
  className?: string
}

function Word({
  word,
  index,
  total,
  scrollYProgress,
}: {
  word: string
  index: number
  total: number
  scrollYProgress: ReturnType<typeof useScroll>['scrollYProgress']
}) {
  const start = index / total
  const end = start + 1 / total

  const opacity = useTransform(scrollYProgress, [start, end], [0.15, 1])
  const color = useTransform(
    scrollYProgress,
    [start, end],
    ['var(--muted-foreground)', 'var(--foreground)'],
  )

  return (
    <motion.span
      style={{ opacity, color }}
      className="inline-block mr-[0.3em] transition-none"
    >
      {word}
    </motion.span>
  )
}

export function ScrollHighlight({ text, className }: ScrollHighlightProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 0.8', 'end 0.3'],
  })

  const words = text.split(' ')

  return (
    <div ref={containerRef} className={className}>
      <p className="text-3xl font-semibold leading-relaxed tracking-display sm:text-4xl md:text-5xl lg:text-[3.5rem] lg:leading-[1.3]">
        {words.map((word, i) => (
          <Word
            key={`${word}-${i}`}
            word={word}
            index={i}
            total={words.length}
            scrollYProgress={scrollYProgress}
          />
        ))}
      </p>
    </div>
  )
}
