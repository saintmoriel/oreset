import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Inter, Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google'
import { Toaster } from '@/components/ui/toast'
import './globals.css'

const SITE_TITLE = 'Oreset | Human Red Team for AI Agents'
const SITE_DESCRIPTION =
  'Your AI agent will be attacked. It will also just decide wrong. Oreset red-teams both: security failures a hacker would exploit and judgement failures that need no hacker at all. Verified findings, live dashboard, free retest.'

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
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  icons: {
    icon: '/oreset-logo v2.png',
    shortcut: '/oreset-logo v2.png',
    apple: '/oreset-logo v2.png',
  },
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: 'https://www.oreset.africa',
    siteName: 'Oreset',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: 'https://www.oreset.africa/og-image.jpeg',
        width: 1200,
        height: 630,
        alt: 'Oreset: human red team for AI agents',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
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
        <Toaster />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}