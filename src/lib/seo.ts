import type { Metadata } from "next";
import { SITE_NAME, SITE_DESCRIPTION } from "@/lib/constants";

interface BuildMetadataOptions {
  title: string;
  description?: string;
  path?: string;
  image?: string;
  noindex?: boolean;
}

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://zahraluxe.com";

export function buildMetadata({
  title,
  description,
  path = "/",
  image,
  noindex = false,
}: BuildMetadataOptions): Metadata {
  const fullTitle = `${title} | ${SITE_NAME}`;
  const desc = description ?? SITE_DESCRIPTION;
  const url = `${BASE_URL}${path}`;
  const ogImage = image ?? `${BASE_URL}/og-default.jpg`;

  return {
    title: fullTitle,
    description: desc,
    metadataBase: new URL(BASE_URL),
    alternates: { canonical: url },
    robots: noindex ? { index: false, follow: false } : undefined,
    openGraph: {
      title: fullTitle,
      description: desc,
      url,
      siteName: SITE_NAME,
      locale: "en_PK",
      type: "website",
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: desc,
      images: [ogImage],
    },
  };
}
