'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MotionReveal } from './motion-reveal'
import {
  Database,
  Mic,
  ImageIcon,
  ShieldCheck,
  Wallet,
  Sliders,
  CheckCheck,
  FileCheck2,
  Users,
  GraduationCap,
  Award,
  BarChart3,
  Network,
  AlertTriangle,
  Clock,
  Layers,
  ArrowRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const originLifecycle = [
  'Scoping',
  'Task Design',
  'Pool Activation',
  'Data Collection',
  'Automated Validation',
  'Quality Review',
  'Contributor Payment',
  'Aggregation',
  'Consent & Licensing',
  'Delivery',
]

const operatorLifecycle = [
  'Sourcing',
  'Training',
  'Certification',
  'Bench',
  'Placement',
  'Account Management',
]

const originSubsections = [
  {
    title: '2.1 Collector Web Interface (Field Origination)',
    description: 'In-field web tools powering location-based origination and contributor engagement.',
    image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Field audio recording and data origination',
    cards: [
      {
        icon: Network,
        name: 'Pool Activation & Task Feed',
        details:
          'Location-based and dialect-filtered task feed displaying open collection requests (e.g., Hausa Cowpea Agri-Image Capture, Yoruba Spoken Audio Script) with compensation rates and submission guidelines.',
      },
      {
        icon: Mic,
        name: 'Audio Capture Module',
        details:
          'In-browser audio recorder with real-time waveform visualization, noise-floor detection, and playback review.',
      },
      {
        icon: ImageIcon,
        name: 'Image Capture Module',
        details:
          'Camera capture interface with metadata extraction (timestamp, geolocation coordinates, crop/pest category tag).',
      },
      {
        icon: ShieldCheck,
        name: 'Built-in Consent Engine',
        details:
          'Mandatory digital consent sign-off modal prior to submission, locking data licensing rights to the Shared Trust Ledger.',
      },
      {
        icon: Wallet,
        name: 'Contributor Wallet',
        details:
          'Real-time balance showing cleared funds, pending quality review balances, and historical payout logs with direct local bank transfer rails.',
      },
    ],
  },
  {
    title: '2.2 Data Operations Studio (Internal Management & Client Delivery)',
    description: 'Centralized admin and review infrastructure for dataset packaging and governance.',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Data Operations Studio and analytics telemetry',
    cards: [
      {
        icon: Sliders,
        name: 'Scoping & Task Design Studio',
        details:
          'Form builder for Oreset admins to launch collection campaigns, define target parameters, set pay rates, and upload reference scripts/imagery templates.',
      },
      {
        icon: CheckCheck,
        name: 'Validation & Quality Review Queue',
        details:
          'Two-pass review queue combining first-pass automated checks (sample rate validation, image resolution filters) with manual review by senior data leads featuring standardized defect tagging.',
      },
      {
        icon: FileCheck2,
        name: 'Licensing & Delivery Vault',
        details:
          'Secure dataset packager aggregating inputs into structured formats (CSV, JSON, WAV/MP3 zips) with encrypted download links, dataset manifests, and verifiable consent certificates.',
      },
    ],
  },
]

const operatorSubsections = [
  {
    title: '3.1 & 3.2 LMS, Training & Certification Engine',
    description: 'Rigorous vetting, 6-module curriculum, and timed evaluation workbench.',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Certified African AI operator training and evaluation',
    cards: [
      {
        icon: GraduationCap,
        name: 'Talent Onboarding & LMS',
        details:
          'Captures regional language fluency baselines (e.g., Yoruba Native, Hausa Level 4), regional dialect variations, and operational English proficiency. Features a 6-module curriculum player with native-language audio walkthroughs and downloadable job aids.',
      },
      {
        icon: Clock,
        name: 'Timed Sprint Workbench',
        details:
          'Dedicated 45-minute timed evaluation workbench displaying 10 unassisted prompt-response pairs replicating live enterprise environments.',
      },
      {
        icon: AlertTriangle,
        name: 'Error Taxonomy Selector',
        details:
          'Standardized tagging menu for ERR-01 (Factual), ERR-02 (Linguistic), ERR-03 (Cultural), and ERR-04 (Domain) errors.',
      },
      {
        icon: Award,
        name: 'Automated Calibration Scoring',
        details:
          'Grading engine with 5-point calibration rating scale (1 = Critical Failure, 5 = Exemplary) enforcing ≥ 90% threshold and zero-critical-error rules to issue Certified Operator Badges.',
      },
    ],
  },
  {
    title: '3.3 & 3.4 Bench Matching & Enterprise Client Portal',
    description: 'Algorithm-driven matching and enterprise-grade operational telemetry.',
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Enterprise Operations Team monitoring live telemetry',
    cards: [
      {
        icon: Users,
        name: 'Operator Bench & Matching Board',
        details:
          'Status hub indicating availability (In-Training, Bench Ready, Deployed) with verified badges. Algorithm pairs operators with accounts based on language, shift hours, and domain specialization (Insurance, Banking, Agriculture).',
      },
      {
        icon: BarChart3,
        name: 'Enterprise Operations Dashboard',
        details:
          'Client portal monitoring operator teams reviewing live AI product outputs with real-time telemetry displaying review volume, throughput speed, IAA scores, and error distribution charts.',
      },
      {
        icon: Layers,
        name: 'Escalation & Account Management',
        details:
          'Ticket escalation queue for high-severity errors (ERR-01 / ERR-04) alongside seat allocation management for adjusting team sizes and shift schedules.',
      },
    ],
  },
]

const tabs = [
  {
    id: 'origin',
    label: 'Oreset Origin',
    eyebrow: 'Data Arm, 10-Stage Lifecycle',
    icon: Database,
    description:
      'The Origin web portal operationalizes the complete 10-stage data origination lifecycle: Scoping, Task Design, Pool Activation, Data Collection, Automated Validation, Quality Review, Contributor Payment, Aggregation, Consent & Licensing, and Delivery.',
    lifecycle: originLifecycle,
    subsections: originSubsections,
  },
  {
    id: 'operators',
    label: 'Oreset Operators',
    eyebrow: 'Talent Arm, 6-Stage Lifecycle',
    icon: Users,
    description:
      'The Operators web portal operationalizes the 6-stage talent lifecycle: Sourcing, Training, Certification, Bench, Placement, and Account Management, providing enterprise-grade native AI evaluation.',
    lifecycle: operatorLifecycle,
    subsections: operatorSubsections,
  },
]

export function NetworkSection() {
  const [activeTab, setActiveTab] = useState(0)
  const current = tabs[activeTab]

  return (
    <section id="network" className="py-24 md:py-36">
      <div className="mx-auto max-w-7xl px-6">
        <MotionReveal>
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-eyebrow text-accent">
              Network Architecture
            </p>
            <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
              Two arms. Built for precision.
            </h2>
            <p className="mt-5 text-pretty text-lg leading-relaxed text-muted-foreground">
              Oreset combines field-level data origination with certified native operator talent
              into a unified, end-to-end platform for African AI.
            </p>
          </div>
        </MotionReveal>

        <MotionReveal delay={0.15}>
          <div className="mt-12 flex flex-col gap-10 lg:flex-row lg:gap-12">
            {/* ── Tab switcher (left) ── */}
            <div className="flex shrink-0 flex-row gap-2 lg:w-64 lg:flex-col lg:gap-2">
              {tabs.map((tab, i) => (
                <button
                  key={tab.id}
                  id={tab.id}
                  onClick={() => setActiveTab(i)}
                  className={cn(
                    'relative flex items-center gap-3 rounded-xl px-5 py-4 text-left text-sm font-semibold transition-all duration-200',
                    activeTab === i
                      ? 'bg-foreground text-background shadow-sm'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                  )}
                >
                  <tab.icon className="size-4 shrink-0" />
                  <div>
                    <p className="font-semibold leading-tight">{tab.label}</p>
                    <p className={cn('mt-0.5 text-xs font-normal', activeTab === i ? 'text-background/70' : 'text-muted-foreground/70')}>
                      {i === 0 ? 'Data Arm' : 'Talent Arm'}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            {/* ── Tab content (right) ── */}
            <div className="relative min-h-[500px] flex-1">
              <AnimatePresence mode="wait">
                <motion.div
                  key={current.id}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="rounded-2xl border border-border/60 bg-card p-6 md:p-10"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-accent/10">
                      <current.icon className="size-5 text-accent" />
                    </div>
                    <p className="text-xs font-semibold uppercase tracking-eyebrow text-accent">
                      {current.eyebrow}
                    </p>
                  </div>

                  <h3 className="mt-4 text-2xl font-semibold tracking-tight md:text-3xl">
                    {current.label}
                  </h3>
                  <p className="mt-3 max-w-2xl text-pretty leading-relaxed text-muted-foreground">
                    {current.description}
                  </p>

                  {/* ── Lifecycle Stepper Pill ── */}
                  <div className="mt-8">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">
                      Operational Lifecycle Pipeline
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {current.lifecycle.map((step, idx) => (
                        <div key={step} className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/70 px-3 py-1 text-xs font-medium text-foreground">
                            <span className="font-mono text-[10px] text-accent font-semibold">{idx + 1}.</span>
                            {step}
                          </span>
                          {idx < current.lifecycle.length - 1 && (
                            <ArrowRight className="size-3 text-muted-foreground/40 shrink-0 hidden sm:inline-block" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ── Subsections & Specification Cards ── */}
                  <div className="mt-10 space-y-8">
                    {current.subsections.map((sub) => (
                      <div key={sub.title} className="overflow-hidden rounded-xl border border-border/40 bg-secondary/30 p-5 md:p-6">
                        {sub.image && (
                          <div className="relative mb-5 h-40 overflow-hidden rounded-lg bg-muted">
                            <img
                              src={sub.image}
                              alt={sub.imageAlt || sub.title}
                              className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                            <div className="absolute bottom-2.5 left-3 text-xs font-semibold text-white">
                              {sub.title}
                            </div>
                          </div>
                        )}
                        <h4 className="text-base font-semibold tracking-tight text-foreground">
                          {sub.title}
                        </h4>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {sub.description}
                        </p>

                        <div className="mt-5 grid gap-4 sm:grid-cols-2">
                          {sub.cards.map((card) => (
                            <div key={card.name} className="flex gap-3 rounded-lg border border-border/40 bg-card p-4 transition-all hover:border-border">
                              <card.icon className="mt-0.5 size-4 shrink-0 text-accent" />
                              <div>
                                <p className="text-sm font-semibold text-foreground">{card.name}</p>
                                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                                  {card.details}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 flex justify-end">
                    <a
                      href="#contact"
                      className="group inline-flex items-center gap-2 text-sm font-semibold text-accent transition-colors hover:text-accent/80"
                    >
                      Inquire about {current.label}
                      <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                    </a>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </MotionReveal>
      </div>
    </section>
  )
}


