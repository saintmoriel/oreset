'use client'

import { motion } from 'framer-motion'
import Dither from './Dither'
import { ArrowDown, CheckCircle2, ShieldCheck, Sparkles, Mic, Database, Users } from 'lucide-react'

const floatingPills = [
  {
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
    label: 'Yoruba Native',
    tag: 'Certified Operator',
    badgeColor: 'bg-accent/15 text-accent border-accent/20',
  },
  {
    avatar: 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=150&q=80',
    label: 'Hausa Agri-Data',
    tag: 'Field Origination',
    badgeColor: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/20',
  },
  {
    avatar: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=150&q=80',
    label: 'Swahili Speech',
    tag: 'Audio Corpora',
    badgeColor: 'bg-blue-500/15 text-blue-600 border-blue-500/20',
  },
  {
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    label: 'Amharic QA',
    tag: 'ERR-01 Certified',
    badgeColor: 'bg-purple-500/15 text-purple-600 border-purple-500/20',
  },
]

export function Hero() {
  return (
    <section
      id="top"
      className="relative flex min-h-[100vh] min-h-[100dvh] flex-col justify-between overflow-hidden pt-28 pb-8 md:pt-36 lg:pt-40"
    >
      {/* Background ambient mesh animation */}
      <div className="absolute inset-0 z-0 opacity-60">
        <Dither />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 my-auto">
        <div className="mx-auto max-w-4xl text-center">
          
          {/* Notion-style Floating Pill Badges Bar */}
          <motion.div
            className="inline-flex flex-wrap items-center justify-center gap-2 rounded-full border border-border/80 bg-card/90 p-1.5 shadow-sm backdrop-blur-md"
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="flex -space-x-2 overflow-hidden px-1">
              {floatingPills.map((pill) => (
                <img
                  key={pill.label}
                  src={pill.avatar}
                  alt={pill.label}
                  className="inline-block size-7 rounded-full border-2 border-background object-cover"
                />
              ))}
            </div>
            <div className="flex items-center gap-1.5 px-2 text-xs font-semibold tracking-wide text-foreground">
              <Sparkles className="size-3.5 text-accent" />
              <span>Consented Data & Certified Operators across 20+ Languages</span>
            </div>
          </motion.div>

          {/* Main heading */}
          <motion.h1
            className="mt-8 text-balance text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl lg:text-[5.5rem]"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            A Data-and-Talent{' '}
            <br className="hidden sm:block" />
            <span className="relative inline-block text-accent">
              Network
              {/* Decorative underline highlight */}
              <svg
                className="absolute -bottom-2 left-0 w-full text-accent/30"
                height="10"
                viewBox="0 0 200 10"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M2 7C50 2 150 2 198 7" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
              </svg>
            </span>{' '}
            <br className="hidden sm:block" />
            for African&nbsp;AI.
          </motion.h1>

          {/* Sub text */}
          <motion.p
            className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg md:text-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            Operationalizing the 10-stage data origination lifecycle and 6-stage certified talent bench to build, calibrate, and localize enterprise African AI systems.
          </motion.p>

          {/* Action Buttons */}
          <motion.div
            className="mt-8 flex flex-col justify-center gap-3.5 sm:flex-row sm:items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <a
              href="#network"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-8 py-3.5 text-sm font-semibold text-accent-foreground shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent/25"
            >
              <Database className="size-4" />
              <span>Explore Network Architecture</span>
            </a>
            <a
              href="#contact"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-foreground/20 bg-card/80 backdrop-blur-sm px-8 py-3.5 text-sm font-semibold text-foreground transition-all duration-200 hover:border-foreground/40 hover:bg-foreground hover:text-background"
            >
              <Users className="size-4" />
              <span>Request Operator Bench</span>
            </a>
          </motion.div>
        </div>

        {/* Notion & Ramp Inspired Product Frame Preview (Bottom Anchor) */}
        <motion.div
          className="mt-12 mx-auto max-w-5xl overflow-hidden rounded-2xl border border-border/80 bg-card/95 shadow-2xl shadow-foreground/5 backdrop-blur-xl transition-all duration-500"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Mac-style Window Titlebar */}
          <div className="flex items-center justify-between border-b border-border/60 bg-secondary/60 px-4 py-3 text-xs">
            <div className="flex items-center gap-2">
              <div className="size-3 rounded-full bg-red-400/80" />
              <div className="size-3 rounded-full bg-amber-400/80" />
              <div className="size-3 rounded-full bg-emerald-400/80" />
              <span className="ml-2 font-mono text-[11px] text-muted-foreground">oreset-network-control-plane.v1</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-600">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Origination Sync
              </span>
            </div>
          </div>

          {/* Integrated Visual Workspace View */}
          <div className="grid gap-6 p-5 sm:grid-cols-2 md:p-6">
            {/* Panel 1: Field Data Origination */}
            <div className="group relative flex flex-col overflow-hidden rounded-xl border border-border/50 bg-secondary/30 p-4 transition-all hover:border-border">
              <div className="relative h-36 overflow-hidden rounded-lg bg-muted">
                <img
                  src="https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=600&q=80"
                  alt="Field collection"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1 rounded bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-md">
                  <Mic className="size-3 text-accent" />
                  <span>Hausa Speech & Crop Dataset</span>
                </div>
                <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-[11px] text-white">
                  <span className="font-mono text-[10px] font-semibold text-emerald-300">Stage 04: Data Collection</span>
                  <span className="rounded bg-emerald-500/90 px-1.5 py-0.5 text-[10px] font-semibold">Consent Locked</span>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-accent">Origin Arm</p>
                  <p className="text-sm font-semibold text-foreground">Location & Dialect Task Feed</p>
                </div>
                <ShieldCheck className="size-5 text-accent/80" />
              </div>
            </div>

            {/* Panel 2: Certified Operator Telemetry */}
            <div className="group relative flex flex-col overflow-hidden rounded-xl border border-border/50 bg-secondary/30 p-4 transition-all hover:border-border">
              <div className="relative h-36 overflow-hidden rounded-lg bg-muted">
                <img
                  src="https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=600&q=80"
                  alt="Certified operator evaluation"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1 rounded bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-md">
                  <CheckCircle2 className="size-3 text-emerald-400" />
                  <span>Yoruba QA Evaluation</span>
                </div>
                <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-[11px] text-white">
                  <span className="font-mono text-[10px] font-semibold text-emerald-300">99.4% IAA Score</span>
                  <span className="rounded bg-accent px-1.5 py-0.5 text-[10px] font-semibold">ERR-02 Tagged</span>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-accent">Operators Arm</p>
                  <p className="text-sm font-semibold text-foreground">Timed Sprint Workbench & Telemetry</p>
                </div>
                <Sparkles className="size-5 text-accent/80" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Subtle Scroll Cue Indicator */}
      <motion.div
        className="relative z-10 mx-auto flex flex-col items-center gap-1 pt-4 text-muted-foreground/60 transition-colors hover:text-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.6 }}
      >
        <a href="#network" className="flex flex-col items-center gap-1 text-[11px] font-medium tracking-wider uppercase">
          <span>Scroll to explore</span>
          <ArrowDown className="size-3.5 animate-bounce text-accent" />
        </a>
      </motion.div>
    </section>
  )
}


