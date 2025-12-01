import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://ammedtech.com'),
  title: {
    default: 'AM Medtech | Leading Pharma Digital Transformation Agency',
    template: '%s | AM Medtech'
  },
  description: 'AM Medtech specializes in Distribution Management System (DMS), Route-to-Market (RTM) strategy, and E-commerce solutions for pharmaceutical companies. Elevate your distribution with our data-driven digital ecosystem.',
  keywords: ['Pharma DMS', 'Pharmaceutical Distribution', 'Route to Market', 'Digital Transformation', 'Pharma E-commerce', 'AM Medtech', 'An Minh Group'],
  authors: [{ name: 'AM Medtech' }],
  creator: 'AM Medtech',
  publisher: 'AM Medtech',
  openGraph: {
    title: 'AM Medtech | Leading Pharma Digital Transformation Agency',
    description: 'Empowering pharma distribution with cutting-edge Distribution Management System (DMS) and AI-driven insights.',
    url: 'https://ammedtech.com',
    siteName: 'AM Medtech',
    images: [
      {
        url: '/banner.png', // Assuming a default banner exists or will be used
        width: 1200,
        height: 630,
        alt: 'AM Medtech Digital Solutions',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AM Medtech | Leading Pharma Digital Transformation Agency',
    description: 'Empowering pharma distribution with cutting-edge DMS and AI-driven insights.',
    images: ['/banner.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <Navbar />
        {children}
      </body>
    </html>
  );
}
