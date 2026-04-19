import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Get a Quote — Commercial Cleaning',
  description:
    'Request a free quote for commercial cleaning in Boston, Cambridge, Brookline, and 20+ Massachusetts towns. Office, retail, medical, and industrial cleaning. Get a custom proposal in 24 hours.',
  openGraph: {
    title: 'Get a Quote — Commercial Cleaning | Honor Cleaning',
    description: 'Request your free commercial cleaning quote online. Same-week availability across Greater Boston.',
  },
};

export default function BookingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
