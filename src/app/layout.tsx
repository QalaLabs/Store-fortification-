import type { Metadata } from 'next';
import './globals.css';
import { AppShell } from '@/components/layout/AppShell';
import { ApiProvider } from '@/lib/api';

export const metadata: Metadata = {
  title: 'CARTGUARD AI — E-Commerce Security & Privacy Operations',
  description: 'AI-Powered E-Commerce Security, Privacy & Compliance Monitoring Platform by QALA LABS',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#080d16] text-slate-100 min-h-screen">
        <ApiProvider>
          <AppShell>{children}</AppShell>
        </ApiProvider>
      </body>
    </html>
  );
}
