import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Haello - Virtual Pet & Self Care',
  description: 'Track your mood, set daily goals, and build healthy habits with us',
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  )
}
