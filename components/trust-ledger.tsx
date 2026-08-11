import { MotionReveal, MotionStagger, MotionStaggerItem } from './motion-reveal'
import { ScanSearch, UserCheck, BadgeCheck } from 'lucide-react'

const steps = [
  {
    icon: ScanSearch,
    n: '01',
    title: 'Automated First-Pass Gatechecks',
    description:
      'First-pass automated checks (sample rate audio validation, image resolution filters, noise-floor detection) screen all raw field inputs before human review.',
  },
  {
    icon: UserCheck,
    n: '02',
    title: 'Two-Pass Review & Error Taxonomy',
    description:
      'Senior data leads and certified operators review submissions using standardized Error Taxonomies (ERR-01 Factual, ERR-02 Linguistic, ERR-03 Cultural, ERR-04 Domain) and 5-point calibration scoring enforcing a ≥90% threshold.',
  },
  {
    icon: BadgeCheck,
    n: '03',
    title: 'Shared Trust Ledger & Licensing Vault',
    description:
      'Approved data packages and certified operators earn audit-ready badges on our Trust Ledger — with mandatory digital consent sign-offs, encrypted download links, and dataset manifest files.',
  },
]

export function TrustLedger() {
  return (
    <section id="about" className="py-24 md:py-36">
      <div className="mx-auto max-w-7xl px-6">
        <MotionReveal>
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-eyebrow text-accent">
              Trust Ledger
            </p>
            <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
              Reliability, proven at every step.
            </h2>
            <p className="mt-5 text-pretty text-lg leading-relaxed text-muted-foreground">
              Our shared quality backbone ensures that every piece of data and every
              operator output meets the highest standard — through a three-stage
              verification pipeline.
            </p>
          </div>
        </MotionReveal>

        {/* Scale-style features grid with border separators */}
        <MotionStagger className="mt-16 grid gap-0 md:grid-cols-3" stagger={0.1}>
          {steps.map((step, i) => (
            <MotionStaggerItem key={step.n}>
              <div
                className={`group relative flex h-full flex-col p-8 transition-colors duration-200 hover:bg-secondary/60 md:p-10 ${
                  i < steps.length - 1 ? 'md:border-r md:border-border/60' : ''
                }`}
              >
                {/* Top border for mobile, left border after first on desktop */}
                {i > 0 && (
                  <div className="absolute inset-x-8 top-0 h-px bg-border/60 md:hidden" />
                )}

                <div className="flex items-center justify-between">
                  <div className="flex size-12 items-center justify-center rounded-xl bg-accent/10 transition-colors duration-200 group-hover:bg-accent/15">
                    <step.icon className="size-5 text-accent" />
                  </div>
                  <span className="font-mono text-sm font-medium text-muted-foreground/40">
                    {step.n}
                  </span>
                </div>

                <h3 className="mt-6 text-xl font-semibold tracking-tight">{step.title}</h3>
                <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">
                  {step.description}
                </p>

                <div className="mt-auto pt-6">
                  <a
                    href="#contact"
                    className="group/link inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-accent"
                  >
                    Learn more
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                      className="transition-transform group-hover/link:translate-x-0.5"
                    >
                      <path
                        d="M1 7H13M13 7L8 2M13 7L8 12"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </a>
                </div>
              </div>
            </MotionStaggerItem>
          ))}
        </MotionStagger>

        {/* Bottom border */}
        <div className="divider-thin" />
      </div>
    </section>
  )
}
