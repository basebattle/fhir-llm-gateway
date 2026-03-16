import type { Metadata } from 'next'
import { DM_Sans, DM_Serif_Display, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-dm-sans' })
const dmSerifDisplay = DM_Serif_Display({ subsets: ['latin'], weight: '400', variable: '--font-dm-serif-display' })
const jetBrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains-mono' })

export const metadata: Metadata = {
  title: 'FHIR-to-LLM Clinical Data Gateway',
  description: 'MCP-native FHIR access layer for AI reasoning.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${dmSans.variable} ${dmSerifDisplay.variable} ${jetBrainsMono.variable}`}>
      <body className="bg-background text-foreground min-h-screen">
        {children}
      </body>
    </html>
  )
}
