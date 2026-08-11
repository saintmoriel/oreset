# Oreset Design Handoff

This document outlines the design system, technical stack, and styling guidelines currently implemented in the Oreset landing page.

## Technical Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4, PostCSS
- **Components**: React 19, partial usage of shadcn/ui patterns (`lucide-react`, `@base-ui/react`)
- **Fonts**: `next/font/google` (Inter)

## Design System

The design aims for a clean, professional, yet warm aesthetic suitable for a platform connecting African language experts with AI development. It relies heavily on high contrast, a subtle warm background, and a deep navy primary color with burnt copper accents.

### Color Palette

Defined via CSS variables in `app/globals.css`:

| Token | Hex/Value | Description |
| :--- | :--- | :--- |
| **Background** | `#ffffff` | Clean, warm near-white paper |
| **Foreground** | `#16213a` | Deep navy (main text color) |
| **Secondary** | `#f6f5f2` | Slightly recessed surface for alternating sections |
| **Primary** | `#16213a` | Deep navy (primary buttons, brand ink) |
| **Primary Foreground** | `#ffffff` | White text on primary buttons |
| **Accent** | `#c56a32` | Burnt copper (used sparingly for highlights, selections, badges) |
| **Muted** | `#f6f5f2` | Muted backgrounds |
| **Muted Foreground** | `#5c6472` | Secondary/helper text |
| **Border / Input** | `#e7e5e0` | Soft, warm borders |
| **Ink** | `#12203a` | Deep ink navy (used for dark contrast sections) |
| **Ink Foreground** | `#f4f6fa` | Light text on ink sections |
| **Ink Muted** | `#9aa4b6` | Muted text on ink sections |

### Typography

- **Primary Font**: [Inter](https://fonts.google.com/specimen/Inter) (sans-serif)
- **Base Style**: Antialiased with optimized legibility. Uses OpenType features `cv11` and `ss01`.
- **Custom Tracking (Letter Spacing)**:
  - `.tracking-display`: `-0.025em` (Tighter tracking for large headings)
  - `.tracking-eyebrow`: `0.14em` (Wider tracking for uppercase/eyebrow text)

### Layout & Spacing

- **Border Radius**: Base radius is `0.75rem` (`12px`).
- **Container**: Max-width is `6xl` (`72rem` / `1152px`) with responsive padding (e.g., `px-6`).
- **Section Rhythm**: Generous top/bottom padding (e.g., `pt-28 pb-16 md:pt-36 md:pb-24`).

### Animations & Transitions

- **Scroll Reveal**: Elements smoothly fade in and slide up as they enter the viewport.
  - Class: `.reveal` (initial state: `opacity: 0`, `translateY(16px)`)
  - Active Class: `.is-visible` (final state: `opacity: 1`, `transform: none`)
  - Timing: `0.7s cubic-bezier(0.22, 1, 0.36, 1)`
  - Respects `prefers-reduced-motion: reduce`.
- **Micro-interactions**: Buttons and links feature smooth hover state transitions (e.g., `hover:-translate-y-0.5`, background color transitions).

## Page Structure

The main landing page (`app/page.tsx`) is structured sequentially:

1. **SiteNav**: Sticky/fixed navigation header.
2. **Hero**: Main value proposition ("Get paid for your language. Help build African AI.") with a stylized contributor metrics card.
3. **LanguageMarquee**: Infinite scroll showcasing supported African languages.
4. **Problem**: Outlines the current state/challenge in the industry.
5. **WhatWeBuild**: Highlights the solution and features of the platform.
6. **Contact**: Call-to-action / form section.
7. **SiteFooter**: Standard footer links and copyright.
