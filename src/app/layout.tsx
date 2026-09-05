import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import SmoothScrollProvider from '@/components/motion/SmoothScrollProvider';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'CyberCast — Predicting Cybercrime Cash Withdrawals Before They Happen',
  description: "An AI-powered predictive analytics framework that transforms India's cybercrime response from reactive to proactive — forecasting likely cash withdrawal locations in real-time to enable timely intervention by law enforcement and financial institutions. Smart India Hackathon 2024 | Problem Statement 184 | Ministry of Home Affairs, I4C",
  icons: {
    icon: '/CyberCast.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable} dark`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Fragment+Mono:ital@0;1&family=JetBrains+Mono:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-obsidian text-white selection:bg-neon selection:text-black antialiased">
        <SmoothScrollProvider>
          {children}
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
