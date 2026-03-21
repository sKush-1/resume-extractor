import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'BulkParser.com - AI-Powered Resume Parsing Platform',
  description: 'Parse, analyze, and extract structured data from resumes with AI-powered intelligence. Perfect for recruiters and HR teams.',
  keywords: ['resume parsing', 'AI resume extractor', 'ATS', 'recruitment automation', 'resume analysis', 'hiring tool'],
  authors: [{ name: 'BulkParser.com' }],
  creator: 'BulkParser.com',
  publisher: 'BulkParser.com',
  alternates: {
    canonical: 'https://bulkparser.com',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      {
        url: '/favicon-32x32.png',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        url: '/favicon-96x96.png',
        sizes: '96x96',
        type: 'image/png',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
  appleWebApp: {
    title: 'BulkParser',
    statusBarStyle: 'default',
    capable: true,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://bulkparser.com',
    siteName: 'BulkParser.com',
    title: 'BulkParser.com - AI-Powered Resume Parsing Platform',
    description: 'Parse, analyze, and extract structured data from resumes with AI-powered intelligence.',
    images: [
      {
        url: 'https://bulkparser.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'BulkParser.com - AI Resume Parsing',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BulkParser.com - AI-Powered Resume Parsing Platform',
    description: 'Parse, analyze, and extract structured data from resumes with AI-powered intelligence.',
    images: ['https://bulkparser.com/og-image.png'],
  },
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "BulkParser.com",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "description": "AI-powered resume parsing platform for extracting structured data from resumes at scale.",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "ratingCount": "120"
  }
};

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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-sans antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  )
}
