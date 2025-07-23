import type { Metadata } from "next";
import { Merriweather, Lato } from "next/font/google";
import "./globals.css";
import "./responsive.css";
import ClientProviders from '@/components/ClientProviders';
import { themeInitScript } from '@/providers/ThemeProvider';

const merriweather = Merriweather({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-merriweather",
});

const lato = Lato({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-lato",
});

export const metadata: Metadata = {
  title: "Teacherly AI - Transform Teaching with Intelligent Grading & Analytics",
  description: "Empower educators with advanced AI technology for automated grading, content generation, and comprehensive student analytics. Reduce administrative workload by 70% while improving learning outcomes.",
  keywords: "AI grading, educational technology, teacher tools, automated grading, student analytics, content generation, education platform",
  authors: [{ name: "Teacherly AI" }],
  creator: "Teacherly AI",
  publisher: "Teacherly AI",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://teacherly.ai",
    title: "Teacherly AI - Transform Teaching with Intelligent Grading & Analytics",
    description: "Empower educators with advanced AI technology for automated grading, content generation, and comprehensive student analytics.",
    siteName: "Teacherly AI",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Teacherly AI - AI-Powered Education Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Teacherly AI - Transform Teaching with Intelligent Grading & Analytics",
    description: "Empower educators with advanced AI technology for automated grading, content generation, and comprehensive student analytics.",
    images: ["/logo.png"],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/logo.png",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Metadata can still be exported from here even if "use client" is at the top,
  // as long as RootLayout itself doesn't use client-only hooks directly.
  // However, best practice is to keep RootLayout as server component if possible.
  // For this case, placing provider and initializer makes this structure fine.
  return (
    <html lang="en" className={`${merriweather.variable} ${lato.variable}`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: themeInitScript,
          }}
        />
      </head>
      <body>
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}

// Note: RootLayout remains a Server Component, allowing metadata export.
// ClientProviders is a Client Component that handles Redux Provider and client-side logic.
