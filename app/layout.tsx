import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Pop-Cycle | Super Cycle Melt Monitor',
  description: 'Track AI industry trends and company growth with real-time metrics',
  icons: {
    icon: '/images/favicon.svg',
  },
  openGraph: {
    title: 'AI Pop-Cycle | Super Cycle Melt Monitor',
    description: 'Track AI industry trends and company growth with real-time metrics',
    url: 'https://your-domain.com',
    siteName: 'AI Pop-Cycle',
    images: [
      {
        url: 'https://your-domain.com/api/og',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Pop-Cycle | Super Cycle Melt Monitor',
    description: 'Track AI industry trends and company growth with real-time metrics',
    images: ['https://your-domain.com/api/og'],
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