import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers";
import { Toaster } from "sonner";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0A0E1A",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://xpayments.digital"),
  title: {
    default: "XPayments.Digital — Plataforma de Pagamentos",
    template: "%s | XPayments.Digital",
  },
  description:
    "XPayments.Digital — Plataforma institucional Web3 para gestão de wallets multi-moeda (EUR, BRL, USDT), settlement automatizado, swap e operações cross-border. A ponte entre o sistema financeiro tradicional e a economia digital.",
  keywords: [
    "XPayments.Digital",
    "Payment Gateway",
    "Fintech",
    "Web3",
    "Crypto",
    "Wallet",
    "Multi-moeda",
    "USDT",
    "EUR",
    "BRL",
    "Settlement",
    "Swap",
    "Cross-border",
    "Pagamentos",
    "Blockchain",
  ],
  authors: [{ name: "XPayments.Digital" }],
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
    url: "https://xpayments.digital",
    siteName: "XPayments.Digital",
    title: "XPayments.Digital — Plataforma de Pagamentos",
    description:
      "Plataforma de pagamentos institucional para gestão multi-moeda (EUR, BRL, USDT), settlement automatizado e operações cross-border.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "XPayments.Digital",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "XPayments.Digital — Plataforma de Pagamentos",
    description:
      "Plataforma de pagamentos institucional para gestão multi-moeda (EUR, BRL, USDT), settlement automatizado e operações cross-border.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
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
      </head>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
