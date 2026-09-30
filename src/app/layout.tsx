import type { Metadata, Viewport } from 'next'
import { Poppins } from 'next/font/google'
import './globals.css'
import { SettingsProvider, settingsBootScript } from '@/contexts/SettingsContext'
import { AuthProvider } from '@/contexts/AuthContext'
import { ToastProvider } from '@/components/ui/Toast'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-poppins',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Haello - Virtual Pet & Self Care',
    template: '%s - Haello',
  },
  description: 'Track your mood, keep a journal, and build daily routines with a virtual pet that grows with you.',
  openGraph: {
    title: 'Haello - Say hello to healing',
    description: 'Track your mood, keep a journal, and build daily routines with a virtual pet that grows with you.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f2f7fe' },
    { media: '(prefers-color-scheme: dark)', color: '#0c1424' },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={poppins.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: settingsBootScript }} />
      </head>
      <body>
        <a
          href="#main"
          className="btn btn-primary sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:left-4 focus-visible:top-4 focus-visible:z-50"
        >
          Skip to content
        </a>
        <AuthProvider>
          <SettingsProvider>
            <ToastProvider>{children}</ToastProvider>
          </SettingsProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
