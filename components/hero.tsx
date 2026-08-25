'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { ArrowRight, ShieldCheck } from 'lucide-react'
import Image from 'next/image'
import { gsap, registerGsap, prefersReducedMotion } from '@/lib/gsap'
import { openPilotModal } from './pilot-scoping-modal'

registerGsap()

const HERO_IMAGE = '/hero-oreset.jpg'

const proof = [
  {
    value: '100%',
    label: 'Opt-in consent',
    detail: 'Zero IP / regulatory liability',
  },
  {
    value: '16 kHz',
    label: '16-bit mono',
    detail: 'Uncompressed ASR standard',
  },
  {
    value: '4-tier',
    label: 'Error taxonomy',
    detail: 'Shared standard, origination to review',
  },
  {
    value: '6-stage',
    label: 'Certified track',
    detail: 'Calibrated before placement',
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
      <div className="absolute inset-0" aria-hidden="true">
        <div ref={imageRef} className="relative h-[115%] w-full will-change-transform md:h-[120%]">
          <Image
            src={HERO_IMAGE}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-[72%_center] sm:object-center"
          />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(105deg,rgba(15,24,41,0.95)_0%,rgba(15,24,41,0.82)_42%,rgba(18,32,58,0.5)_70%,rgba(197,106,50,0.2)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(15,24,41,0.75)_0%,transparent_45%)]" />
        <div ref={overlayRef} className="absolute inset-0 bg-ink opacity-0" />
      </div>

      <div
        ref={contentRef}
        className="relative z-10 flex flex-1 flex-col justify-end pb-0 pt-32 sm:pt-36 md:pt-40"
      >
        <div className="container-wide pb-10 sm:pb-12 md:pb-14">
          <div className="max-w-3xl">
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
                Scope a Pilot Batch
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </button>
              <a
                href="#origin"
                className="inline-flex h-12 w-full items-center justify-center rounded-md border border-white/25 bg-white/5 px-6 text-sm font-semibold text-white backdrop-blur-sm transition-[background-color,border-color] duration-200 hover:border-white/45 hover:bg-white/12 sm:w-auto"
              >
                How Origin works
              </a>
            </div>
          </div>
        </div>

        {/* Proof strip */}
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