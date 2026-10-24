import type { Metadata } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import "./globals.css";
import { SITE_NAME, SITE_TAGLINE, SITE_DESCRIPTION } from "@/lib/constants";
import { StorefrontShell } from "@/components/layout/StorefrontShell";
import { getCurrencyRates } from "@/server/queries/currency";
import { getSiteSetting } from "@/server/queries/settings";
import { getNavigationItems } from "@/server/queries/navigation";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  display: "swap",
});

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: `${SITE_NAME} | ${SITE_TAGLINE}`,
  description: SITE_DESCRIPTION,
  metadataBase: new URL("https://ahmedaliansari.com"),
  openGraph: {
    title: `${SITE_NAME} | ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    siteName: SITE_NAME,
    locale: "en_PK",
    type: "website",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [rates, announcementText, headerNav, footerNav] = await Promise.all([
    getCurrencyRates(),
    getSiteSetting("announcement_text"),
    getNavigationItems("header"),
    getNavigationItems("footer"),
  ]);

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: "https://ahmedaliansari.com",
    logo: "https://ahmedaliansari.com/images/logo.png",
    sameAs: [
      "https://instagram.com/ahmedaliansari.official",
      "https://www.facebook.com/share/1M1kjqDWHj/",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      telephone: "+92 309 2045906",
      areaServed: "Worldwide",
      availableLanguage: ["English", "Urdu"],
    },
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: "https://ahmedaliansari.com",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://ahmedaliansari.com/shop?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${jost.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-ivory text-ink selection:bg-ink selection:text-ivory font-sans">
        <StorefrontShell
          announcementText={announcementText}
          rates={rates}
          headerNav={headerNav}
          footerNav={footerNav}
        >
          {children}
        </StorefrontShell>
      </body>
    </html>
  );
}
