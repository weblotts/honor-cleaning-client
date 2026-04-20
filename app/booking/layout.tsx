import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Get a Free Quote — Commercial Cleaning',
  description:
    'Request a free quote for commercial cleaning in Boston, Cambridge, Brookline, and 20+ Massachusetts towns. Office, retail, medical, and industrial cleaning. Get a custom proposal in 24 hours.',
  openGraph: {
    title: 'Get a Free Quote — Commercial Cleaning | Honor Cleaning',
    description: 'Request your free commercial cleaning quote online. Same-week availability across Greater Boston.',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'Honor Cleaning — Get a Free Quote',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Get a Free Quote — Honor Cleaning',
    description: 'Request your free commercial cleaning quote online. Same-week availability across Greater Boston.',
    images: ['/opengraph-image'],
  },
};

export default function BookingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
