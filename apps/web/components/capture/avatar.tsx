import { User } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Avatar({
  displayName,
  className,
  iconClassName,
}: {
  displayName?: string | null
  className?: string
  iconClassName?: string
}) {
  const initials = displayName
    ? displayName
        .trim()
        .split(/\s+/)
        .map((part) => part[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : null

  return (
    <span
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full bg-accent/15 font-semibold text-accent',
        className,
      )}
    >
      {initials ?? <User className={iconClassName} />}
    </span>
  )
}
