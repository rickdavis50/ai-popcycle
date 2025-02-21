import { Montserrat } from 'next/font/google';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { Analytics } from "@vercel/analytics/react";

const montserrat = Montserrat({ subsets: ['latin'] });

export const metadata = {
  title: 'AI Industry Pulse',
  description: 'AI Industry Statistics and Insights',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={montserrat.className}>
      <head>
        <link rel="icon" href="/images/favicon.svg" />
        <title>AI Industry Pulse</title>
      </head>
      <body>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
        <Analytics />
      </body>
    </html>
  );
}
