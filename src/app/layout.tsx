import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers";
import { Toaster } from "sonner";
import { PwaRegister } from '@/components/pwa/pwa-register';
import { PwaInstallPrompt } from '@/components/pwa/pwa-install-prompt';

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  minimumScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0A0E1A" },
  ],
};

const SITE_URL = "https://xpayments.digital";
const SITE_TITLE = "XPayments.Digital — Plataforma de Pagamentos Institucional";
const SITE_DESCRIPTION =
  "XPayments.Digital — Plataforma institucional Web3 para gestão de wallets multi-moeda (EUR, BRL, USDT), settlement automatizado, swap e operações cross-border. Gateway de pagamentos white-label para merchants.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: "%s | XPayments.Digital",
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "XPayments.Digital",
    "Payment Gateway",
    "Fintech",
    "Web3",
    "Crypto Payments",
    "Wallet Multi-moeda",
    "USDT",
    "EUR",
    "BRL",
    "Settlement",
    "Swap",
    "Cross-border",
    "Pagamentos",
    "Blockchain",
    "PIX",
    "SEPA",
    "White-label Gateway",
    "Merchant Dashboard",
    "Business Account",
  ],
  authors: [{ name: "XPayments.Digital", url: SITE_URL }],
  creator: "XPayments.Digital",
  publisher: "XPayments.Digital",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: SITE_URL,
    siteName: "XPayments.Digital",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "XPayments.Digital — Plataforma de Pagamentos Institucional",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
  category: "finance",
  alternates: {
    canonical: SITE_URL,
  },
};

// ── JSON-LD Structured Data ──
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FinancialService",
  name: "XPayments.Digital",
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  description: SITE_DESCRIPTION,
  areaServed: [
    { "@type": "Country", name: "Brazil" },
    { "@type": "Country", name: "Portugal" },
    { "@type": "Country", name: "European Union" },
  ],
  serviceType: [
    "Payment Gateway",
    "Digital Wallet",
    "Currency Exchange",
    "Cross-border Payments",
  ],
  knowsAbout: ["Blockchain", "Cryptocurrency", "Fiat Payments", "SEPA", "PIX"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://api.xpayments.digital" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased bg-background text-foreground`}
      >
        <PwaRegister />
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster richColors position="top-right" />
        </ThemeProvider>
        <PwaInstallPrompt />
      </body>
    </html>
  );
}