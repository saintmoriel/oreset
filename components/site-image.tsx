import Image, { type ImageProps } from 'next/image'
import { cn } from '@/lib/utils'

type Props = ImageProps & {
  className?: string
}

/** Consistent responsive image defaults for landing photography */
export function SiteImage({ className, sizes, alt, ...props }: Props) {
  return (
    <Image
      alt={alt}
      sizes={sizes ?? '(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 640px'}
      className={cn('h-full w-full object-cover', className)}
      {...props}
    />
  )
}
