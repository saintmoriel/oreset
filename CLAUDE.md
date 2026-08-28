# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # Start dev server
pnpm build        # Production build (TS errors ignored via next.config)
pnpm lint         # ESLint
```

No test framework is configured.

## Architecture

Next.js 16 App Router with React 19, TypeScript, Tailwind CSS v4, and shadcn/ui (base-nova style).

**Routes:**
- `/` — single-page marketing site (all section components rendered in sequence in `app/page.tsx`)
- `/operators/join` — operator cohort application form

**Animation stack:** GSAP + ScrollTrigger for scroll-driven effects, Lenis for smooth scrolling, Framer Motion available but GSAP preferred. All animation respects `prefers-reduced-motion`.

- `components/smooth-scroll.tsx` — initializes Lenis and syncs with GSAP ticker
- `components/scroll-orchestrator.tsx` — global scroll-triggered parallax/reveals via `data-*` attributes
- `components/motion-reveal.tsx` — reusable GSAP reveal primitives (`MotionReveal`, `MotionStagger`, `MotionStaggerItem`)
- `lib/gsap.ts` — plugin registration and reduced-motion helper

**Cross-component communication:** Custom DOM events (`oreset:open-pilot`, `oreset:scroll-stop`, `oreset:scroll-start`) rather than global state.

**Styling system:** CSS custom properties define brand color ramps in `app/globals.css`. Custom utility classes: `.text-display`, `.text-h1`–`.text-h4`, `.text-eyebrow`, `.card-surface`, `.container-page`/`-wide`/`-narrow`, `.photo-brand`. Use `cn()` from `lib/utils.ts` for conditional classes.

**Path alias:** `@/*` maps to project root.

## Brand Constraints

- Colors: Navy `#16213a`, Copper `#c56a32`, Paper `#faf8f4`
- No fabricated traction — no fake counters, fake client logos, or live dashboards
- CTAs: "Partner with us", "Start a pilot", "See how it works"
- All page components are client components (`'use client'`) due to animation dependencies

## Package Manager

pnpm (use `pnpm add` for dependencies).

## Deployment

Vercel. Domain: oreset.africa. Vercel Analytics included.
