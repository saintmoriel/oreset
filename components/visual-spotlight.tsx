'use client'

import { motion } from 'framer-motion'
import { MotionReveal } from './motion-reveal'
import { Award, CheckCircle2, MapPin, Sparkles } from 'lucide-react'

const spotlights = [
  {
    name: 'Amina Bello',
    role: 'Certified AI Operator — Hausa Track',
    location: 'Kano, Nigeria',
    language: 'Hausa (Native)',
    domain: 'Agriculture & NLP',
    calibrationScore: '99.2%',
    hoursLogged: '1,420 hrs',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
    quote: 'Validating crop disease diagnostic models and audio speech scripts in native Hausa dialects.',
  },
  {
    name: 'Kofi Mensah',
    role: 'Senior Data Lead — Twi & Ewe Track',
    location: 'Accra, Ghana',
    language: 'Twi / Ewe (Native)',
    domain: 'Banking & Fintech QA',
    calibrationScore: '98.8%',
    hoursLogged: '2,150 hrs',
    image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=600&q=80',
    quote: 'Conducting two-pass error taxonomy reviews (ERR-01 & ERR-04) for enterprise financial assistant LLMs.',
  },
  {
    name: 'Zuri Njoroge',
    role: 'Field Origination Specialist',
    location: 'Nairobi, Kenya',
    language: 'Swahili (Native)',
    domain: 'Audio & Speech Corpora',
    calibrationScore: '97.9%',
    hoursLogged: '980 hrs',
    image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=600&q=80',
    quote: 'Managing location-based field speech collection with real-time waveform noise-floor detection.',
  },
  {
    name: 'Tariq Al-Mansoor',
    role: 'Certified AI Operator — Arabic Track',
    location: 'Cairo, Egypt',
    language: 'Arabic (Egyptian Native)',
    domain: 'Medical & Healthcare QA',
    calibrationScore: '99.5%',
    hoursLogged: '1,890 hrs',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    quote: 'Calibrating multi-turn medical conversation models against strict zero-critical-error standards.',
  },
]

export function VisualSpotlight() {
  return (
    <section className="relative overflow-hidden py-24 md:py-36 bg-secondary/40">
      <div className="mx-auto max-w-7xl px-6">
        <MotionReveal>
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-eyebrow text-accent">
                <Sparkles className="size-3.5" />
                <span>Verified Talent Spotlight</span>
              </div>
              <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
                Certified Operators in Action
              </h2>
              <p className="mt-4 text-pretty text-base leading-relaxed text-muted-foreground md:text-lg">
                Meet the certified native-language professionals power-testing and calibrating AI systems across the African continent.
              </p>
            </div>
            <a
              href="#contact"
              className="inline-flex items-center justify-center rounded-full border border-foreground/20 bg-card px-6 py-2.5 text-sm font-semibold transition-all hover:bg-foreground hover:text-background"
            >
              Request Operator Bench
            </a>
          </div>
        </MotionReveal>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {spotlights.map((person, idx) => (
            <MotionReveal key={person.name} delay={idx * 0.1}>
              <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-card p-4 transition-all duration-300 hover:-translate-y-1 hover:border-border hover:shadow-xl">
                {/* Operator Image */}
                <div className="relative h-60 w-full overflow-hidden rounded-xl bg-muted">
                  <img
                    src={person.image}
                    alt={person.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-md">
                    <MapPin className="size-3 text-accent" />
                    <span>{person.location}</span>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 rounded bg-emerald-500/90 px-2 py-0.5 text-[10px] font-semibold text-white">
                      <CheckCircle2 className="size-3" />
                      {person.calibrationScore} Calibrated
                    </span>
                    <span className="font-mono text-[10px] font-semibold text-white/80">
                      {person.hoursLogged}
                    </span>
                  </div>
                </div>

                {/* Info Content */}
                <div className="mt-4 flex flex-1 flex-col px-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold tracking-tight text-foreground">{person.name}</h3>
                    <Award className="size-4 text-accent shrink-0" />
                  </div>
                  <p className="mt-0.5 text-xs font-medium text-accent">{person.role}</p>

                  <div className="mt-3 flex flex-wrap gap-1.5 text-[11px]">
                    <span className="rounded-md bg-secondary px-2 py-0.5 font-medium text-foreground">
                      {person.language}
                    </span>
                    <span className="rounded-md bg-accent/10 px-2 py-0.5 font-medium text-accent">
                      {person.domain}
                    </span>
                  </div>

                  <p className="mt-4 text-xs italic leading-relaxed text-muted-foreground/90">
                    &ldquo;{person.quote}&rdquo;
                  </p>
                </div>
              </div>
            </MotionReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
