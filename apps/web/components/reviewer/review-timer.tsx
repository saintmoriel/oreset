'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Clock, Pause } from 'lucide-react'
import { cn } from '@/lib/utils'

const IDLE_TIMEOUT_MS = 5 * 60 * 1000

export function useReviewTimer() {
  const [elapsedMs, setElapsedMs] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const lastActivityRef = useRef(Date.now())

  const resetActivity = useCallback(() => {
    lastActivityRef.current = Date.now()
    if (isPaused) setIsPaused(false)
  }, [isPaused])

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      const idleFor = Date.now() - lastActivityRef.current
      if (idleFor >= IDLE_TIMEOUT_MS) {
        setIsPaused(true)
        return
      }
      setElapsedMs((prev) => prev + 1000)
    }, 1000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  useEffect(() => {
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart']
    events.forEach((e) => window.addEventListener(e, resetActivity))
    return () => events.forEach((e) => window.removeEventListener(e, resetActivity))
  }, [resetActivity])

  const reset = useCallback(() => {
    setElapsedMs(0)
    setIsPaused(false)
    lastActivityRef.current = Date.now()
  }, [])

  return { elapsedMs, isPaused, reset }
}

function formatTime(ms: number) {
  const totalSec = Math.floor(ms / 1000)
  const min = Math.floor(totalSec / 60)
  const sec = totalSec % 60
  return `${min}:${sec.toString().padStart(2, '0')}`
}

export function ReviewTimer({ elapsedMs, isPaused }: { elapsedMs: number; isPaused: boolean }) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 font-mono text-xs tabular-nums',
        isPaused
          ? 'border-warning/50 bg-warning/10 text-warning'
          : 'border-border bg-card text-muted-foreground',
      )}
    >
      {isPaused ? <Pause className="size-3" /> : <Clock className="size-3" />}
      <span>{formatTime(elapsedMs)}</span>
      {isPaused && <span className="text-[10px] font-medium uppercase">Paused</span>}
    </div>
  )
}
