import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: 'AM Medtech | Leading Pharma Digital Transformation Agency',
  description: 'AM Medtech specializes in DMS, Route-to-Market (RTM) strategy, and E-commerce solutions for pharmaceutical companies. Elevate your distribution with our data-driven digital ecosystem.',
  keywords: ['Pharma DMS', 'Pharmaceutical Distribution', 'Route to Market', 'Digital Transformation', 'Pharma E-commerce', 'AM Medtech', 'An Minh Group'],
  openGraph: {
    title: 'AM Medtech | Leading Pharma Digital Transformation Agency',
    description: 'Empowering pharma distribution with cutting-edge DMS and AI-driven insights.',
    type: 'website',
    locale: 'en_US',
    siteName: 'AM Medtech',
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
        {children}
      </body>
    </html>
  );
}
