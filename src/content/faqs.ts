export interface FAQItem {
  question: string;
  answer: string;
  category: "Craftsmanship" | "Ordering & Sizing" | "Shipping & Delivery" | "Payments & Returns";
}

export const FAQS: FAQItem[] = [
  {
    category: "Craftsmanship",
    question: "What fabrics and techniques are used in Zahra Luxe formal wear?",
    answer: "Every Zahra Luxe piece is created using pure hand-woven fabrics including pure silk organza, raw silk 80g, velvet, and handcrafted chiffon. Our embroideries feature traditional zardozi, tilla, dabka, resham threadwork, and hand-placed cutdana pearls created by master artisans in Karachi and Lahore.",
  },
  {
    category: "Ordering & Sizing",
    question: "How do custom sizing and bespoke tailoring work?",
    answer: "We offer complimentary bespoke customization on all made-to-order couture. You can select your closest size from our size chart (XXS to XXL) and enter custom measurements in the tailoring notes at checkout, or contact our WhatsApp concierge directly after ordering with your custom measurement chart.",
  },
  {
    category: "Ordering & Sizing",
    question: "What is the lead time for bespoke formal orders?",
    answer: "Each luxury ensemble is handcrafted by our master ateliers. Standard formal wear requires 3 to 4 weeks for production and hand-finishing. Heavy formal and bridal wear requires 6 to 8 weeks. Rush orders can be accommodated upon prior consultation with our styling team.",
  },
  {
    category: "Shipping & Delivery",
    question: "Do you ship internationally?",
    answer: "Yes, we provide worldwide insured express courier delivery (via DHL Express / FedEx) to over 30 countries including the United States, United Kingdom, Canada, Australia, UAE, Saudi Arabia, and Europe. International delivery typically takes 5 to 7 business days once dispatch commences.",
  },
  {
    category: "Shipping & Delivery",
    question: "What are the shipping charges within Pakistan?",
    answer: "We offer complimentary white-glove express courier shipping for all domestic orders across Pakistan with tracked delivery via leading couriers.",
  },
  {
    category: "Payments & Returns",
    question: "How does the 50% deposit option work?",
    answer: "To initiate handcrafting of made-to-order couture, you may choose our Bespoke 50% Deposit option at checkout. You pay 50% upon placing the order to book artisan hours. The remaining 50% balance is payable upon completion prior to courier dispatch.",
  },
  {
    category: "Payments & Returns",
    question: "What is your return and exchange policy?",
    answer: "Because our formal couture pieces are made specifically to individual orders with hand-embroidery and custom sizing, bespoke orders are non-refundable once tailoring commences. If your garment arrives with a defect or deviation from requested specifications, our atelier will provide complimentary alterations or replacement.",
  },
];
