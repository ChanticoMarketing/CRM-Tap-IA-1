import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Avenue CRM - Command Center',
  description: 'Marketing Agency CRM',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="light">
      <head>
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=optional"
        />
      </head>
      <body className="bg-background text-on-background font-body-md min-h-screen flex antialiased">
        {children}
      </body>
    </html>
  )
}
