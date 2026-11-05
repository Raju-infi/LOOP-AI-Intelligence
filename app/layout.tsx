
import './globals.css';
import { SessionProvider } from '@/components/session-provider';

export const metadata = {
  title: 'LOOP AI Intelligence — Feedback Intelligence',
  description: 'Feedback Intelligence platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
