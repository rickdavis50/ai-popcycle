import { Montserrat } from 'next/font/google';
import { ErrorBoundary } from '../components/ErrorBoundary';

const montserrat = Montserrat({ subsets: ['latin'] });

export const metadata = {
  title: 'AI Industry Pulse',
  description: 'AI Industry Statistics and Insights',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={montserrat.className}>
      <body>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}
