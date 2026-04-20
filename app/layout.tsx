import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import './globals.css';

const BASE_URL = 'https://honorcleaning.com';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'Honor Cleaning — Commercial Cleaning Services in Massachusetts',
    template: '%s | Honor Cleaning',
  },
  description:
    'Boston\'s trusted commercial cleaning company. Office cleaning, retail, medical facility sanitization, and industrial cleaning across 20+ Massachusetts towns. Licensed, insured, eco-friendly. Get a quote in 2 minutes.',
  keywords: [
    'commercial cleaning Boston',
    'office cleaning Massachusetts',
    'janitorial services Boston',
    'commercial cleaning MA',
    'medical facility cleaning',
    'retail store cleaning Boston',
    'warehouse cleaning service',
    'recurring office cleaning plan',
    'eco friendly commercial cleaning Boston',
    'professional office cleaners Cambridge',
    'janitorial services Brookline',
    'office cleaning Newton',
    'commercial cleaning company near me',
    'post construction cleaning Boston',
    'Honor Cleaning',
  ],
  authors: [{ name: 'Honor Cleaning' }],
  creator: 'Honor Cleaning',
  publisher: 'Honor Cleaning',
  formatDetection: {
    telephone: true,
    email: true,
    address: true,
  },
  icons: {
    icon: [
      { url: '/logo.png', type: 'image/png' },
    ],
    apple: [
      { url: '/logo.png', type: 'image/png' },
    ],
    shortcut: '/logo.png',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Honor Cleaning',
    title: 'Honor Cleaning — Commercial Cleaning Services in Massachusetts',
    description:
      'Boston\'s trusted commercial cleaning company. Office, retail, medical, and industrial cleaning across 20+ MA towns. Get a quote in 2 minutes.',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'Honor Cleaning — Commercial Cleaning Services in Greater Boston, MA',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Honor Cleaning — Commercial Cleaning Services in MA',
    description:
      'Licensed & insured commercial cleaning services across Greater Boston. Get your free quote online today.',
    images: ['/opengraph-image'],
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
  alternates: {
    canonical: '/',
  },
};

// JSON-LD structured data for local business
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  '@id': 'https://honorcleaning.com',
  name: 'Honor Cleaning',
  description: 'Professional commercial cleaning services for offices, retail, medical facilities, and industrial spaces in Massachusetts.',
  url: 'https://honorcleaning.com',
  telephone: '+1-508-333-1838',
  email: 'hello@honorcleaning.com',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Boston',
    addressRegion: 'MA',
    addressCountry: 'US',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 42.3601,
    longitude: -71.0589,
  },
  areaServed: {
    '@type': 'State',
    name: 'Massachusetts',
  },
  priceRange: '$$',
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    reviewCount: '200',
  },
  openingHours: 'Mo-Su 00:00-23:59',
  sameAs: [],
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Commercial Cleaning Services',
    itemListElement: [
      {
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: 'Office Cleaning' },
      },
      {
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: 'Retail & Storefront Cleaning' },
      },
      {
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: 'Medical Facility Cleaning' },
      },
      {
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: 'Industrial & Warehouse Cleaning' },
      },
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body suppressHydrationWarning className="font-sans">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              borderRadius: '12px',
              padding: '14px 18px',
              fontSize: '14px',
              fontWeight: 500,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            },
            success: {
              iconTheme: { primary: '#16a34a', secondary: '#fff' },
              style: { background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0' },
            },
            error: {
              iconTheme: { primary: '#dc2626', secondary: '#fff' },
              style: { background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' },
              duration: 5000,
            },
          }}
        />
      </body>
    </html>
  );
}
