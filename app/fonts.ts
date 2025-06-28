import { Inter, Montserrat, Roboto_Mono } from 'next/font/google';

// Primary font for headings
export const montserrat = Montserrat({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-primary',
});

// Secondary font for body text
export const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-secondary',
});

// Monospace font for code blocks
export const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
});