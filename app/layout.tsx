import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Pop-Cycle | Super Cycle Melt Monitor',
  description: 'Track AI industry trends and company growth with real-time metrics',
  icons: [
    {
      rel: 'icon',
      url: '/images/favicon.svg',
      type: 'image/svg+xml',
    },
    {
      rel: 'apple-touch-icon',
      url: '/images/favicon.svg',
    }
  ],
  openGraph: {
    title: 'AI Pop-Cycle | Super Cycle Melt Monitor',
    description: 'Track AI industry trends and company growth with real-time metrics',
    url: 'https://ai-popcycle.vercel.app',
    siteName: 'AI Pop-Cycle',
    images: [
      {
        url: '/images/ai_pop_cycle.png',
        width: 1200,
        height: 630,
        alt: 'AI Pop-Cycle'
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Pop-Cycle | Super Cycle Melt Monitor',
    description: 'Track AI industry trends and company growth with real-time metrics',
    images: ['/images/ai_pop_cycle.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
} 