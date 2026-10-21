import Link from "next/link";
import Image from "next/image";
import {
  SITE_NAME,
  SITE_TAGLINE,
  CONTACT_EMAIL,
  CONTACT_PHONE,
  CONTACT_ADDRESS,
  INSTAGRAM_URL,
  FACEBOOK_URL,
  FOOTER_POLICY_LINKS,
  NAV_LINKS,
} from "@/lib/constants";
import { Container } from "@/components/ui/Container";
import { NewsletterForm } from "./NewsletterForm";
import type { NavigationItem } from "@/types";

interface FooterProps {
  navItems?: NavigationItem[];
}

export function Footer({ navItems }: FooterProps) {
  const currentYear = new Date().getFullYear();
  const policies = navItems && navItems.length > 0 ? navItems : FOOTER_POLICY_LINKS;

  return (
    <footer className="border-t border-hairline bg-[#F2EDE4] text-ink pt-16 sm:pt-20 pb-12">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 pb-16 border-b border-hairline">
          {/* Brand Column (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <Link href="/" className="inline-block mb-1">
              <Image
                src="/images/logo.png"
                alt={SITE_NAME}
                width={140}
                height={55}
                className="h-10 w-auto object-contain"
              />
            </Link>
            <p className="font-sans text-xs uppercase tracking-[0.14em] text-stone">
              {SITE_TAGLINE}
            </p>
            <p className="font-sans text-xs text-stone max-w-sm leading-relaxed">
              Premium embroidered fabrics crafted with elegance and delivered with trust. Luxurious Pakistani Eastern-wear and kurtis.
            </p>
          </div>

          {/* Navigation Links (2 cols) */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <h4 className="font-sans text-xs uppercase tracking-[0.14em] font-medium text-ink">
              Collections
            </h4>
            <ul className="flex flex-col gap-2.5">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-xs text-stone hover:text-ink transition-colors font-sans"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Details (3 cols) */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            <h4 className="font-sans text-xs uppercase tracking-[0.14em] font-medium text-ink">
              Lahore Atelier
            </h4>
            <div className="flex flex-col gap-2 text-xs text-stone font-sans leading-relaxed">
              <p>{CONTACT_ADDRESS}</p>
              <a
                href={`tel:${CONTACT_PHONE.replace(/\s+/g, "")}`}
                className="hover:text-ink transition-colors"
              >
                {CONTACT_PHONE}
              </a>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="hover:text-ink transition-colors"
              >
                {CONTACT_EMAIL}
              </a>
            </div>

            <div className="flex items-center gap-4 pt-2">
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-sans uppercase tracking-[0.1em] text-stone hover:text-ink transition-colors"
              >
                Instagram
              </a>
              <span className="text-hairline">/</span>
              <a
                href={FACEBOOK_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-sans uppercase tracking-[0.1em] text-stone hover:text-ink transition-colors"
              >
                Facebook
              </a>
            </div>
          </div>

          {/* Newsletter Placeholder (3 cols, Part 1) */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            <h4 className="font-sans text-xs uppercase tracking-[0.14em] font-medium text-ink">
              The Private Gazette
            </h4>
            <p className="text-xs text-stone font-sans leading-relaxed">
              Receive private invitations to bridal previews, trunk shows, and bespoke consultations.
            </p>
            <NewsletterForm />
          </div>
        </div>

        {/* Bottom Bar: Copyright & Policies */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-stone font-sans">
          <p>© {currentYear} {SITE_NAME}. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-6">
            {policies.map((policy) => (
              <Link
                key={policy.href}
                href={policy.href}
                className="hover:text-ink transition-colors"
              >
                {policy.label}
              </Link>
            ))}
          </div>
        </div>
      </Container>
    </footer>
  );
}
