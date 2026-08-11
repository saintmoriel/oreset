'use client'

import { MotionReveal, MotionStagger, MotionStaggerItem } from './motion-reveal'

const markers = [
  { label: 'CAC-registered', detail: 'Oreset Africa Hub' },
  { label: 'Selected', detail: 'iDICE Founders Lab · Stage 2' },
  { label: 'Based in', detail: 'Abuja, Nigeria' },
]

export function TrustStrip() {
  return (
    <section
      aria-label="Company status"
      className="border-b border-border/60 bg-card/60 py-5 md:py-6"
    >
      <div className="container-wide">
        <MotionStagger
          className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-6"
          stagger={0.1}
        >
          {markers.map((m) => (
            <MotionStaggerItem key={m.label}>
              <div className="flex items-baseline gap-2.5">
                <span className="motif-dot shrink-0 self-center" aria-hidden="true" />
                <span className="text-caption font-semibold uppercase tracking-eyebrow text-muted-foreground">
                  {m.label}
                </span>
                <span className="text-body-sm font-medium text-foreground">{m.detail}</span>
              </div>
            </MotionStaggerItem>
          ))}
        </MotionStagger>
      </div>
    </section>
  )
}
