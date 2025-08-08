import './globals.css'
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Vinsa Bill - Complete Business Management Solution',
  description: 'Comprehensive billing and inventory management system for businesses. Manage inventory, generate GST bills, track customers, and analyze business performance. Made by Lagishetti Vignesh.',
  keywords: ['billing', 'inventory management', 'GST billing', 'business management', 'point of sale', 'vinsa bill'],
  authors: [{ name: 'Lagishetti Vignesh', url: 'https://vinsabill.com' }],
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <div id="root">{children}</div>
        </body>
      </html>
    </ClerkProvider>
  )
}
