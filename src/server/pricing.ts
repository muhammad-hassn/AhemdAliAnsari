import "server-only";

interface PricingInput {
  items: Array<{ price_pkr: number; quantity: number }>;
  shipping_pkr: number;
  payment_option: "full" | "deposit";
}

export interface PricingResult {
  subtotal_pkr: number;
  shipping_pkr: number;
  total_pkr: number;
  amount_due_now_pkr: number;
  amount_balance_pkr: number;
}

export function computePricing(input: PricingInput): PricingResult {
  const subtotal_pkr = input.items.reduce(
    (sum, item) => sum + item.price_pkr * item.quantity,
    0,
  );
  const shipping_pkr = input.shipping_pkr;
  const total_pkr = subtotal_pkr + shipping_pkr;
  const amount_due_now_pkr =
    input.payment_option === "deposit"
      ? Math.ceil(total_pkr * 0.5)
      : total_pkr;
  const amount_balance_pkr = total_pkr - amount_due_now_pkr;

  return {
    subtotal_pkr,
    shipping_pkr,
    total_pkr,
    amount_due_now_pkr,
    amount_balance_pkr,
  };
}

export function computeShipping(
  countryCode: string,
  subtotal: number,
  shippingZones: Array<{
    country_codes: string[];
    price_pkr: number;
    free_over_pkr: number | null;
  }>,
): number {
  const zone = shippingZones.find((z) =>
    z.country_codes.length === 0 || z.country_codes.includes(countryCode),
  );
  if (!zone) return 0;
  if (zone.free_over_pkr !== null && subtotal >= zone.free_over_pkr) return 0;
  return zone.price_pkr;
}
