'use client'

import { motion } from 'framer-motion'

export function Contact() {
  return (
    <section id="contact" className="relative overflow-hidden py-32 md:py-44 lg:py-52">
      {/* Subtle gradient background */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-secondary/60 via-transparent to-transparent"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-6 text-center">
        <motion.p
          className="text-xs font-semibold uppercase tracking-eyebrow text-accent"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          Get Started
        </motion.p>

        <motion.h2
          className="mx-auto mt-6 max-w-4xl text-balance text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          Ready to build with African data and&nbsp;talent?
        </motion.h2>

        <motion.p
          className="mx-auto mt-6 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground md:text-xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          Whether you need consented datasets, certified operators, or both —
          we&apos;d love to hear about your project.
        </motion.p>

        <motion.div
          className="mt-12 flex flex-col justify-center gap-4 sm:flex-row"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <a
            href="mailto:hello@oreset.com?subject=Inquiry%20from%20oreset.com"
            className="inline-flex items-center justify-center rounded-full bg-accent px-8 py-4 text-sm font-semibold text-accent-foreground transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent/20"
          >
            Get in touch
          </a>
          <a
            href="#network"
            className="inline-flex items-center justify-center rounded-full border border-foreground/20 bg-transparent px-8 py-4 text-sm font-semibold text-foreground transition-all duration-200 hover:border-foreground/40 hover:bg-foreground hover:text-background"
          >
            Explore the network
          </a>
        </motion.div>

        <motion.p
          className="mt-8 text-sm text-muted-foreground"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          Or email us directly at{' '}
          <a href="mailto:hello@oreset.com" className="font-medium text-accent underline-offset-4 hover:underline">
            hello@oreset.com
          </a>
        </motion.p>
      </div>
    </section>
  )
}
