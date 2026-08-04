import type { Metadata } from 'next';
import { Fraunces, Source_Sans_3, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
  axes: ['opsz', 'SOFT', 'WONK'],
});

const sourceSans = Source_Sans_3({
  subsets: ['latin'],
  variable: '--font-source-sans',
  display: 'swap',
});

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-plex-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Catequese com Adultos | Paróquia Nossa Senhora do Rosário',
  description:
    'Sistema de catequese de adultos da Paróquia Nossa Senhora do Rosário, Vila Velha-ES: encontros semanais, versículo do dia, galeria e questionários.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body
        className={`${fraunces.variable} ${sourceSans.variable} ${plexMono.variable} font-body textura-cal min-h-screen`}
      >
        <Header />
        <main className="mx-auto max-w-5xl px-4 pb-16 pt-6 sm:px-6">{children}</main>
      </body>
    </html>
  );
}
