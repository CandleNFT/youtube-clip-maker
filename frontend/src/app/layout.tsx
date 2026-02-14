import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'YouTube Clip Maker',
  description: 'Transform YouTube videos into engaging clips with AI-powered analysis',
  keywords: 'YouTube, clips, video editing, AI, automation',
  authors: [{ name: 'YouTube Clip Maker' }],
  themeColor: '#0a0a0a',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
          {children}
        </div>
      </body>
    </html>
  )
}