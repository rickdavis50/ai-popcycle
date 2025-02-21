import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Pop-Cycle | Super Cycle Melt Monitor',
  description: 'Track AI industry trends and company growth with real-time metrics',
  metadataBase: new URL('https://ai-popcycle.vercel.app'),
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