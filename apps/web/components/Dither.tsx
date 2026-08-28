'use client'

export default function Dither() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Ambient soft glowing mesh spots */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 size-[650px] rounded-full bg-gradient-to-tr from-accent/12 via-emerald-500/5 to-transparent blur-3xl opacity-70" />
      <div className="absolute top-1/3 -left-32 size-[450px] rounded-full bg-gradient-to-br from-blue-500/8 via-accent/5 to-transparent blur-3xl opacity-60" />
      <div className="absolute top-1/2 -right-32 size-[450px] rounded-full bg-gradient-to-bl from-purple-500/8 via-accent/5 to-transparent blur-3xl opacity-60" />

      {/* Geometric SVG dot pattern */}
      <div className="absolute inset-0 dot-pattern opacity-40" />
    </div>
  )
}
