'use client'

import { cn } from '@/lib/utils'

export function StepProgress({ steps, current }: { steps: readonly string[]; current: number }) {
  return (
    <ol className="flex items-center">
      {steps.map((label, i) => {
        const state = i < current ? 'done' : i === current ? 'active' : 'upcoming'
        return (
          <li key={label} className="flex items-center">
            <span className="flex items-center gap-2">
              <span
                className={cn(
                  'flex size-6 shrink-0 items-center justify-center rounded-full text-[0.6875rem] font-semibold',
                  state === 'done' && 'bg-accent text-accent-foreground',
                  state === 'active' && 'bg-navy-800 text-white',
                  state === 'upcoming' && 'bg-paper-200 text-muted-foreground',
                )}
              >
                {state === 'done' ? '✓' : i + 1}
              </span>
              <span
                className={cn(
                  'hidden text-caption font-medium sm:inline',
                  state === 'upcoming' ? 'text-muted-foreground' : 'text-foreground',
                )}
              >
                {label}
              </span>
            </span>
            {i < steps.length - 1 && (
              <span className="mx-2 h-px w-4 shrink-0 bg-border sm:mx-3 sm:w-8" aria-hidden="true" />
            )}
          </li>
        )
      })}
    </ol>
  )
}
