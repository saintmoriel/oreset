'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { ArrowRight, ShieldCheck, CheckCircle2, Activity, Volume2 } from 'lucide-react'
import Image from 'next/image'
import { gsap, registerGsap, prefersReducedMotion } from '@/lib/gsap'
import { openPilotModal } from './pilot-scoping-modal'

registerGsap()

const HERO_IMAGE = '/hero-oreset.jpg'

const proof = [
  {
    value: '2,144',
    label: 'languages spoken in Africa',
    detail: 'just 20 served by a regional LLM',
  },
  {
    value: '0',
    label: 'frameworks that check this',
    detail: 'fluency gets tested, consequence doesn\u2019t',
  },
  {
    value: '2-check',
    label: 'verification, not 1',
    detail: 'understanding and outcome, scored separately',
  },
  {
    value: '100%',
    label: 'opt-in consent',
    detail: 'zero IP / regulatory liability',
  },
] as const

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const section = sectionRef.current
      const image = imageRef.current
      const content = contentRef.current
      const overlay = overlayRef.current
      if (!section || !image || !content) return

      if (prefersReducedMotion()) {
        gsap.set([image, content], { clearProps: 'all', opacity: 1 })
        return
      }

      const mm = gsap.matchMedia()

      mm.add('(min-width: 768px)', () => {
        gsap.set(image, { scale: 1.12 })
        const intro = gsap.timeline({ defaults: { ease: 'power3.out' } })
        intro
          .to(image, { scale: 1.03, duration: 1.8 }, 0)
          .from(
            content.querySelectorAll('[data-hero-item]'),
            { y: 32, autoAlpha: 0, duration: 0.8, stagger: 0.07 },
            0.1,
          )

        gsap.to(image, {
          yPercent: 14,
          scale: 1.08,
          ease: 'none',
          force3D: true,
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: 'bottom top',
            scrub: 0.85,
          },
        })

        if (overlay) {
          gsap.to(overlay, {
            opacity: 0.45,
            ease: 'none',
            scrollTrigger: {
              trigger: section,
              start: 'top top',
              end: 'bottom top',
              scrub: true,
            },
          })
        }
      })

      mm.add('(max-width: 767px)', () => {
        gsap.from(content.querySelectorAll('[data-hero-item]'), {
          y: 20,
          autoAlpha: 0,
          duration: 0.65,
          stagger: 0.06,
          ease: 'power3.out',
        })
      })

      return () => mm.revert()
    },
    { scope: sectionRef },
  )

  return (
    <section
      ref={sectionRef}
      id="top"
      className="relative flex min-h-[100svh] flex-col overflow-hidden"
    >
      {/* Background Image & Contrast Gradient Overlay */}
      <div className="absolute inset-0" aria-hidden="true">
        <div ref={imageRef} className="relative h-[115%] w-full will-change-transform md:h-[120%]">
          <Image
            src={HERO_IMAGE}
            alt="Oreset Human Ground-Truth Capture"
            fill
            priority
            sizes="100vw"
            className="object-cover object-[30%_center] filter brightness-95 contrast-105"
          />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(105deg,rgba(15,24,41,0.95)_0%,rgba(15,24,41,0.85)_48%,rgba(18,32,58,0.60)_78%,rgba(197,106,50,0.20)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(15,24,41,0.90)_0%,transparent_50%)]" />
        <div ref={overlayRef} className="absolute inset-0 bg-ink opacity-0" />
      </div>

      {/* Main Content & Glassmorphism Card Grid */}
      <div
        ref={contentRef}
        className="relative z-10 flex flex-1 flex-col justify-end pb-0 pt-28 sm:pt-32 md:pt-36"
      >
        <div className="container-wide pb-10 sm:pb-12 md:pb-14">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">
            
            {/* Left Column: Headline, Trust Badge & CTAs */}
            <div className="lg:col-span-7">
              {/* Trust badge */}
              <p
                data-hero-item
                className="inline-flex max-w-full items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-medium text-white/85 backdrop-blur-sm sm:text-xs"
              >
                <ShieldCheck className="size-3.5 shrink-0 text-accent" aria-hidden="true" />
                <span className="text-balance">
                  Consented Ground Truth &amp; Certified Native Operator Infrastructure
                </span>
              </p>

              <h1
                data-hero-item
                className="mt-5 text-balance font-display text-[clamp(1.85rem,5.2vw,3.75rem)] font-semibold leading-[1.08] tracking-[-0.03em] text-white sm:mt-6"
              >
                A language error shouldn't decide who gets &nbsp; paid.
              </h1>

              <p
                data-hero-item
                className="mt-4 max-w-2xl text-pretty text-sm leading-relaxed text-white/70 sm:mt-5 sm:text-base md:text-lg"
              >
                A claim gets denied. A loan gets misjudged. 
                A transaction gets flagged — not because the logic was wrong, 
                but because the AI misread the Pidgin, Yoruba, or Hausa behind it. 
                Oreset verifies that AI-driven decisions across African languages are actually correct.
              </p>

              <div
                data-hero-item
                className="mt-7 flex w-full flex-col gap-3 sm:mt-8 sm:w-auto sm:flex-row sm:items-center"
              >
                <button
                  type="button"
                  onClick={() => openPilotModal()}
                  className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-accent px-6 text-sm font-semibold text-accent-foreground shadow-[0_10px_30px_rgba(197,106,50,0.35)] transition-[transform,background-color] duration-200 hover:-translate-y-0.5 hover:bg-copper-600 sm:w-auto"
                >
                  Verify a Decision
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </button>
                <a
                  href="#origin"
                  className="inline-flex h-12 w-full items-center justify-center rounded-md border border-white/25 bg-white/5 px-6 text-sm font-semibold text-white backdrop-blur-sm transition-[background-color,border-color] duration-200 hover:border-white/45 hover:bg-white/12 sm:w-auto"
                >
                  How Verification Works
                </a>
              </div>
            </div>

            {/* Right Column: Live Decision Trace Glassmorphism Card */}
            <div data-hero-item className="lg:col-span-5">
              <div className="relative mx-auto w-full max-w-md rounded-2xl border border-white/15 bg-slate-900/85 p-5 shadow-2xl backdrop-blur-md lg:max-w-none">
                
                {/* Header Row */}
                <div className="flex items-center justify-between border-b border-white/10 pb-3 font-mono text-[11px] text-white/60">
                  <div className="flex items-center gap-2">
                    <span className="relative flex size-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75"></span>
                      <span className="relative inline-flex size-2 rounded-full bg-cyan-500"></span>
                    </span>
                    <span className="font-semibold text-cyan-400 uppercase tracking-wider">Live Decision Trace</span>
                  </div>
                  <span className="flex items-center gap-1">
                    <Volume2 className="size-3 text-white/40" />
                    Abuja Hub • 16kHz
                  </span>
                </div>

                {/* Live Capture Display */}
                <div className="my-4 space-y-2 rounded-lg bg-black/40 p-3.5 border border-white/5">
                  <div className="flex items-center justify-between text-[10px] font-mono text-white/40">
                    <span>Captured Audio Payload</span>
                    <Activity className="size-3 text-cyan-400 animate-pulse" />
                  </div>
                  <p className="text-xs sm:text-sm font-sans italic text-white/90">
                    "I wan reverse this payment, se o ti wo?"
                  </p>
                  <div className="flex items-center gap-2 pt-1 font-mono text-[10px]">
                    <span className="rounded bg-indigo-500/20 px-2 py-0.5 font-medium text-indigo-300 border border-indigo-500/30">
                      Pidgin / Yoruba Mix
                    </span>
                    <span className="text-white/50">Parse Confidence: 98.4%</span>
                  </div>
                </div>

                {/* Outcome Verification Gate */}
                <div className="flex items-center justify-between rounded-xl bg-emerald-950/60 p-3 border border-emerald-500/40">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 shrink-0 text-emerald-400" />
                    <div>
                      <div className="font-mono text-xs font-bold text-emerald-400 tracking-wider">
                        DECISION VERIFIED
                      </div>
                      <div className="text-[10px] text-white/60">
                        Action: Claim Dispute Approved
                      </div>
                    </div>
                  </div>
                  <span className="rounded bg-emerald-500/10 px-2 py-1 font-mono text-[10px] font-semibold text-emerald-300 border border-emerald-500/30">
                    Zero Context Error
                  </span>
                </div>

                {/* Sub-label */}
                <p className="mt-3 text-center font-mono text-[10px] text-white/40">
                  Real-time intent-to-outcome verification pipeline
                </p>

              </div>
            </div>

          </div>
        </div>

        {/* Proof Strip */}
        <div
          data-hero-item
          className="border-t border-white/10 bg-ink/40 backdrop-blur-md"
        >
          <div className="container-wide">
            <ul className="grid grid-cols-2 gap-0 lg:grid-cols-4">
              {proof.map((item, i) => (
                <li
                  key={item.label}
                  className={`border-white/10 px-4 py-5 sm:px-5 sm:py-6 ${
                    i % 2 === 1 ? 'border-l' : ''
                  } ${i >= 2 ? 'border-t lg:border-t-0' : ''} ${
                    i > 0 ? 'lg:border-l' : ''
                  }`}
                >
                  <p className="font-display text-xl font-semibold tracking-tight text-white sm:text-2xl">
                    {item.value}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-white/90 sm:text-sm">
                    {item.label}
                  </p>
                  <p className="mt-0.5 text-[11px] leading-snug text-white/50 sm:text-caption">
                    {item.detail}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}