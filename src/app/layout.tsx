import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export const metadata: Metadata = {
  title: "TUMAN VPN — Свободный интернет",
  description: "Быстрый и безопасный VPN для России. YouTube, Instagram, Discord, ChatGPT — без ограничений. Банки и госуслуги продолжают работать. 3 дня бесплатно.",
  keywords: ["VPN", "TUMAN", "обход блокировок", "YouTube", "Instagram", "Discord", "Россия", "VLESS", "Reality", "бесплатный VPN"],
  metadataBase: new URL("https://tuman.help"),
  icons: {
    icon: "/favicon.svg",
    apple: "/favicon.svg",
  },
  openGraph: {
    title: "TUMAN VPN — Свободный интернет",
    description: "YouTube, Instagram, Discord — без ограничений. Банки работают. 3 дня бесплатно.",
    url: "https://tuman.help",
    siteName: "TUMAN VPN",
    type: "website",
    locale: "ru_RU",
  },
  twitter: {
    card: "summary_large_image",
    title: "TUMAN VPN — Свободный интернет",
    description: "YouTube, Instagram, Discord — без ограничений. 3 дня бесплатно.",
  },
  alternates: { canonical: "https://tuman.help" },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const nonce = headers().get("x-nonce") ?? "";

  return (
    <html lang="ru">
      <head>
        <script
          nonce={nonce}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "TUMAN VPN",
              applicationCategory: "UtilitiesApplication",
              operatingSystem: "iOS, Android, Windows, macOS, Linux",
              offers: { "@type": "Offer", price: "199", priceCurrency: "RUB", description: "Базовый тариф — 1 устройство, 30 дней" },
              aggregateRating: { "@type": "AggregateRating", ratingValue: "4.8", ratingCount: "150" },
            }),
          }}
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
