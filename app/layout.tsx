import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Pop-Cycle | Super Cycle Melt Monitor',
  description: 'Track AI industry trends and company growth with real-time metrics',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon.svg', type: 'image/svg+xml' }
    ]
  },
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
  }
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