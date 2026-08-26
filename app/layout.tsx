import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Inter, Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://www.oreset.africa'),
  title: 'Oreset | Independent AI Decision Verification for African Languages',
  description:
    "When AI misreads Yoruba, Hausa, or Pidgin, it doesn't just sound wrong — it can decide a claim, a loan, or a transaction incorrectly. Oreset verifies AI-driven decisions before they cost someone something.",
  icons: {
    icon: '/oreset-logo.jpeg',
    shortcut: '/oreset-logo.jpeg',
    apple: '/oreset-logo.jpeg',
  },
  openGraph: {
    title: 'Oreset | Independent AI Decision Verification for African Languages',
    description:
      "When AI misreads Yoruba, Hausa, or Pidgin, it doesn't just sound wrong — it can decide a claim, a loan, or a transaction incorrectly. Oreset verifies AI-driven decisions before they cost someone something.",
    url: 'https://www.oreset.africa',
    siteName: 'Oreset',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: 'https://www.oreset.africa/og-image.jpeg',
        width: 1200,
        height: 630,
        alt: 'Oreset — Independent AI Decision Verification for African Languages',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Oreset | Independent AI Decision Verification for African Languages',
    description:
      "When AI misreads Yoruba, Hausa, or Pidgin, it doesn't just sound wrong — it can decide a claim, a loan, or a transaction incorrectly. Oreset verifies AI-driven decisions before they cost someone something.",
    images: ['https://www.oreset.africa/og-image.jpeg'],
  },
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#0f172a',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${plusJakartaSans.variable} ${jetbrainsMono.variable} bg-background`}
    >
      <body className="font-sans antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}