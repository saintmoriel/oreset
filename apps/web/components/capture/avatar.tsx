import { User } from 'lucide-react'
import { cn } from '@/lib/utils'

// Photo when there is one, initials when there is a name, icon otherwise.
export function Avatar({
  displayName,
  src,
  className,
  iconClassName,
}: {
  displayName?: string | null
  src?: string | null
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

  if (src) {
    return (
      <span className={cn('flex shrink-0 overflow-hidden rounded-full bg-navy-100', className)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={displayName ?? 'Profile photo'} className="size-full object-cover" />
      </span>
    )
  }

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
