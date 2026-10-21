"use client";

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/Accordion";
import type { ProductDetails } from "@/types";

interface ProductAccordionProps {
  description: string;
  details: ProductDetails;
}

export function ProductAccordion({
  description,
  details,
}: ProductAccordionProps) {
  return (
    <div className="w-full pt-6">
      <Accordion type="single" collapsible defaultValue="description">
        {/* 1. Description */}
        <AccordionItem value="description">
          <AccordionTrigger>Ensemble Overview</AccordionTrigger>
          <AccordionContent>
            <p className="leading-relaxed text-xs sm:text-sm text-stone font-sans">
              {description}
            </p>
          </AccordionContent>
        </AccordionItem>

        {/* 2. Fabric & Details */}
        <AccordionItem value="details">
          <AccordionTrigger>Artisanal Specifications</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2 text-xs font-sans">
              <div className="flex justify-between py-1 border-b border-hairline/60">
                <span className="text-stone">Shirt / Kurti:</span>
                <span className="text-ink font-medium">{details.fabric}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-hairline/60">
                <span className="text-stone">Trouser / Bottom:</span>
                <span className="text-ink font-medium">{details.trouser}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-hairline/60">
                <span className="text-stone">Dupatta / Veil:</span>
                <span className="text-ink font-medium">{details.dupatta}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-stone">Workmanship:</span>
                <span className="text-ink font-medium">Hand Zardozi, Resham, Marori & Sequins</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 3. Shipping & Delivery */}
        <AccordionItem value="shipping">
          <AccordionTrigger>Shipping & White-Glove Delivery</AccordionTrigger>
          <AccordionContent>
            <p className="leading-relaxed text-xs text-stone font-sans">
              Domestic deliveries across Pakistan arrive within 3-5 business days of creation. International orders are dispatched via express courier (DHL / FedEx) with door-to-door tracking. All bridal couture ensembles are packaged in bespoke archive boxes with garment preservation bags.
            </p>
          </AccordionContent>
        </AccordionItem>

        {/* 4. Care Instructions */}
        <AccordionItem value="care">
          <AccordionTrigger>Garment Care & Preservation</AccordionTrigger>
          <AccordionContent>
            <ul className="list-disc list-inside space-y-1 text-xs text-stone font-sans">
              <li>Dry clean only at an accredited couture specialist.</li>
              <li>Do not steam iron directly over metallic zardozi or bead embellishments.</li>
              <li>Store in the provided breathable muslin cover away from direct sunlight and humidity.</li>
              <li>Handle fine nettings and tilla cords with care to prevent snagging.</li>
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
