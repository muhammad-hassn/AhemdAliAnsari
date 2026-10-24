import { buildMetadata } from "@/lib/seo";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { getSiteSettings } from "@/server/queries/settings";
import { ContactForm } from "@/components/contact/ContactForm";
import { FAQS } from "@/content/faqs";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/Accordion";
import {
  CONTACT_EMAIL,
  CONTACT_PHONE,
  WHATSAPP_NUMBER,
  CONTACT_ADDRESS,
} from "@/lib/constants";
import { MessageSquare, Mail, Phone, MapPin } from "lucide-react";

export const metadata = buildMetadata({
  title: "Contact Concierge",
  description: "Connect with Ali Ahmed Ansari ateliers in Lahore and Karachi for bespoke bridal and formal inquiries.",
  path: "/contact",
});

export default async function ContactPage() {
  const settings = await getSiteSettings();

  const phone = settings.contact_phone || CONTACT_PHONE;
  const email = settings.contact_email || CONTACT_EMAIL;
  const whatsapp = settings.whatsapp_number || WHATSAPP_NUMBER;
  const location = settings.store_location || CONTACT_ADDRESS;

  const cleanWhatsApp = whatsapp.replace(/[^0-9]/g, "");
  const waLink = `https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent("Hello Ahmed Ali Ansari, I would like to inquire about your embroidered collection.")}`;

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <main className="min-h-screen bg-ivory pt-8 pb-20">
      <Section className="pt-4">
        <Container>
          <div className="border-b border-stone-light/60 pb-8 mb-12 text-center max-w-2xl mx-auto">
            <span className="text-xs uppercase tracking-widest text-gold font-sans font-medium block mb-2">
              Bespoke Concierge & Client Services
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-ink font-normal">
              Connect with the Atelier
            </h1>
            <p className="text-xs sm:text-sm text-stone mt-2 font-sans">
              For bridal appointments, custom measurements, and couture guidance.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left 6 Columns: Contact Form & Studio Details */}
            <div className="lg:col-span-6 space-y-8">
              <div className="bg-cream border border-stone-light/60 p-6 sm:p-8 space-y-6">
                <div>
                  <h2 className="font-serif text-2xl text-ink">Direct Inquiry</h2>
                  <p className="text-xs uppercase tracking-widest text-stone mt-1">
                    Transmissions are responded to within 24 business hours
                  </p>
                </div>
                <ContactForm />
              </div>

              {/* Direct Touchpoints Card */}
              <div className="bg-cream border border-stone-light/60 p-6 space-y-4 text-xs font-sans">
                <h3 className="font-serif text-xl text-ink border-b border-stone-light/40 pb-3">
                  Atelier Concierge Direct Lines
                </h3>

                <div className="space-y-3 pt-1">
                  <div className="flex items-start gap-3">
                    <MessageSquare className="h-4 w-4 text-emerald-800 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-medium text-ink block">WhatsApp Direct Chat</span>
                      <a
                        href={waLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-stone hover:text-ink underline"
                      >
                        {whatsapp} (Click to launch WhatsApp)
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="h-4 w-4 text-ink shrink-0 mt-0.5" />
                    <div>
                      <span className="font-medium text-ink block">Phone Consultation</span>
                      <a href={`tel:${phone.replace(/\s+/g, "")}`} className="text-stone hover:text-ink">
                        {phone}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Mail className="h-4 w-4 text-ink shrink-0 mt-0.5" />
                    <div>
                      <span className="font-medium text-ink block">Editorial & Client Care</span>
                      <a href={`mailto:${email}`} className="text-stone hover:text-ink">
                        {email}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-ink shrink-0 mt-0.5" />
                    <div>
                      <span className="font-medium text-ink block">Private Flagship Salon</span>
                      <p className="text-stone">{location}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right 6 Columns: FAQ Accordion */}
            <div className="lg:col-span-6 space-y-6">
              <div className="bg-cream border border-stone-light/60 p-6 sm:p-8 space-y-6">
                <div>
                  <h2 className="font-serif text-2xl text-ink">Frequently Addressed Questions</h2>
                  <p className="text-xs uppercase tracking-widest text-stone mt-1">
                    Guidance on sizing, embroidery craftsmanship, and global transit
                  </p>
                </div>

                <Accordion type="single" collapsible className="w-full">
                  {FAQS.map((faq, idx) => (
                    <AccordionItem key={idx} value={`faq-${idx}`}>
                      <AccordionTrigger className="text-left text-xs font-sans tracking-wide">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-xs text-stone font-sans leading-relaxed">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </main>
    </>
  );
}
