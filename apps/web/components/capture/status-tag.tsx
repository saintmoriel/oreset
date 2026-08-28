import { cn } from '@/lib/utils'

type Tone = 'success' | 'warning' | 'destructive' | 'neutral'

const DOT_CLASS: Record<Tone, string> = {
  success: 'bg-success',
  warning: 'bg-warning',
  destructive: 'bg-destructive',
  neutral: 'bg-navy-300',
}

export const TONE_TEXT_CLASS: Record<Tone, string> = {
  success: 'text-success',
  warning: 'text-warning',
  destructive: 'text-destructive',
  neutral: 'text-navy-500',
}

// Quiet status indicator (dot + label) for everything except genuinely
// verified states — those get <VerificationSeal /> instead. Deliberately
// not a colored pill: a rounded-full badge on every status is the exact
// "pill badges with no real meaning" pattern this app is avoiding.
export function StatusTag({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  return (
    <span className={cn('cx-tag', TONE_TEXT_CLASS[tone])}>
      <span className={cn('cx-tag-dot', DOT_CLASS[tone])} aria-hidden="true" />
      {children}
    </span>
  )
}
