"use client";

import { usePathname } from "next/navigation";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { SmoothScrollProvider } from "@/components/motion/SmoothScrollProvider";
import type { CurrencyRate, NavigationItem } from "@/types";

interface StorefrontShellProps {
  announcementText: string | null;
  rates: CurrencyRate[];
  headerNav: NavigationItem[];
  footerNav: NavigationItem[];
  children: React.ReactNode;
}

export function StorefrontShell({
  announcementText,
  rates,
  headerNav,
  footerNav,
  children,
}: StorefrontShellProps) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) {
    return <div className="min-h-screen w-full">{children}</div>;
  }

  return (
    <SmoothScrollProvider>
      <AnnouncementBar text={announcementText || undefined} />
      <Header rates={rates} navItems={headerNav} />
      <main className="flex-1">{children}</main>
      <Footer navItems={footerNav} />
      <CartDrawer />
    </SmoothScrollProvider>
  );
}
