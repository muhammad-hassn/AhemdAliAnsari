"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Search, Heart, ShoppingBag, Menu, User } from "lucide-react";
import { SITE_NAME, NAV_LINKS } from "@/lib/constants";
import { CurrencySwitcher } from "./CurrencySwitcher";
import { MobileMenu } from "./MobileMenu";
import { useCartStore } from "@/store/use-cart-store";
import { useWishlistStore } from "@/store/use-wishlist-store";
import type { CurrencyRate, NavigationItem } from "@/types";
import { cn } from "@/lib/utils";

const emptySubscribe = () => () => {};

interface HeaderProps {
  rates?: CurrencyRate[];
  navItems?: NavigationItem[];
}

export function Header({ rates, navItems }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
  const pathname = usePathname();

  const openCart = useCartStore((state) => state.openCart);
  const totalCartItems = useCartStore((state) => state.getTotalItems());
  const wishlistItems = useWishlistStore((state) => state.items);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 w-full transition-all duration-300 border-b",
          isScrolled
            ? "bg-ivory/90 backdrop-blur-md border-hairline py-3.5 shadow-xs"
            : "bg-ivory border-hairline/40 py-5",
        )}
      >
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 flex items-center justify-between relative">
          {/* Left: Mobile Hamburger + Brand Logo + Desktop Nav */}
          <div className="flex items-center gap-4 sm:gap-6 lg:gap-8">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              className="lg:hidden p-1.5 -ml-1.5 text-ink hover:text-gold transition-colors cursor-pointer"
            >
              <Menu className="h-5 w-5 stroke-[1.5]" />
            </button>

            {/* Brand Logo on the Left */}
            <Link
              href="/"
              className="inline-flex items-center group py-0.5"
              aria-label="Ahmed Ali Ansari Home"
            >
              <Image
                src="/images/logo.png"
                alt="Ahmed Ali Ansari Logo"
                width={120}
                height={50}
                className="h-9 sm:h-11 w-auto object-contain transition-transform group-hover:scale-105 duration-300"
                priority
              />
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-7 pl-3 border-l border-hairline/60">
              {(navItems && navItems.length > 0 ? navItems : NAV_LINKS).map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "font-sans text-xs uppercase tracking-[0.14em] transition-colors relative py-1",
                      isActive
                        ? "text-ink font-medium"
                        : "text-ink/80 hover:text-gold font-normal",
                    )}
                  >
                    {link.label}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-ink" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Center: Brand Name */}
          <div className="absolute left-1/2 -translate-x-1/2 text-center pointer-events-auto">
            <Link href="/" className="group block py-0.5">
              <span className="font-heading text-lg sm:text-xl lg:text-2xl font-light tracking-[0.22em] uppercase text-ink group-hover:text-gold transition-colors whitespace-nowrap block">
                Ahmed Ali Ansari
              </span>
              <span className="hidden sm:block text-[8.5px] uppercase tracking-[0.32em] text-ink/60 font-sans font-light -mt-0.5">
                Haute Couture & Pret
              </span>
            </Link>
          </div>

          {/* Right: Actions (Currency, Search, Account, Wishlist, Cart) */}
          <div className="flex items-center gap-2.5 sm:gap-4 lg:gap-5">
            <div className="hidden sm:block">
              <CurrencySwitcher rates={rates} />
            </div>

            <Link
              href="/shop"
              aria-label="Search collection"
              className="p-1.5 text-ink/80 hover:text-gold transition-colors"
            >
              <Search className="h-4 w-4 stroke-[1.5]" />
            </Link>

            <Link
              href="/account"
              aria-label="My Account"
              className="p-1.5 text-ink/80 hover:text-gold transition-colors"
            >
              <User className="h-4 w-4 stroke-[1.5]" />
            </Link>

            <Link
              href="/wishlist"
              aria-label="View wishlist"
              className="p-1.5 text-ink/80 hover:text-gold transition-colors relative"
            >
              <Heart className="h-4 w-4 stroke-[1.5]" />
              {mounted && wishlistItems.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-3.5 min-w-[14px] px-1 flex items-center justify-center bg-burgundy text-ivory text-[9px] font-sans font-medium">
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            <button
              type="button"
              onClick={openCart}
              aria-label={mounted ? `Open cart with ${totalCartItems} items` : "Open cart"}
              className="p-1.5 text-ink/80 hover:text-gold transition-colors relative cursor-pointer"
            >
              <ShoppingBag className="h-4 w-4 stroke-[1.5]" />
              {mounted && totalCartItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-3.5 min-w-[14px] px-1 flex items-center justify-center bg-ink text-ivory text-[9px] font-sans font-medium">
                  {totalCartItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        rates={rates}
      />
    </>
  );
}
