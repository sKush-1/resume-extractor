import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'ResumeParse - AI-Powered Resume Parsing Platform',
  description: 'Parse, analyze, and extract structured data from resumes with AI-powered intelligence. Perfect for recruiters and HR teams.',
  keywords: ['resume parsing', 'ATS', 'recruitment', 'resume analysis', 'hiring'],
  authors: [{ name: 'ResumeParse' }],
  creator: 'ResumeParse',
  publisher: 'ResumeParse',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://resumeparse.app',
    siteName: 'ResumeParse',
    title: 'ResumeParse - AI-Powered Resume Parsing Platform',
    description: 'Parse, analyze, and extract structured data from resumes with AI-powered intelligence.',
  },
}

import { Toaster } from '@/components/ui/sonner'
import { AuthProvider } from '@/contexts/auth-context'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <script src="https://accounts.google.com/gsi/client" async defer></script>
      </head>
      <body className="font-sans antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster position="bottom-right" richColors />
        <Analytics />
      </body>
    </html>
  )
}
