import { z } from "zod";

const ALLOWED_COUNTRY_CODES = ["PK", "US", "GB", "CA", "AU", "AE", "SA", "DE", "FR", "NL", "SE", "NO", "DK", "CH", "SG", "MY", "BD", "IN"] as const;

export const addressSchema = z.object({
  label: z.string().min(1).max(50).default("Home"),
  full_name: z.string().min(2, "Full name required").max(100),
  phone: z.string().min(7, "Valid phone required").max(20),
  line1: z.string().min(5, "Address line required").max(200),
  line2: z.string().max(200).optional(),
  city: z.string().min(2, "City required").max(100),
  state: z.string().min(2, "State/Province required").max(100),
  postal_code: z.string().min(3, "Postal code required").max(20),
  country_code: z.enum(ALLOWED_COUNTRY_CODES, { errorMap: () => ({ message: "Please select a country" }) }),
});

export const checkoutSchema = z.object({
  email: z.string().email("Invalid email"),
  phone: z.string().min(7, "Valid phone required").max(20),
  shipping_address: addressSchema,
  payment_method_code: z.string().min(1, "Select a payment method"),
  payment_option: z.enum(["full", "deposit"]),
  customer_note: z.string().max(500).optional(),
  currency_code: z.string().length(3).default("PKR"),
  currency_rate: z.number().positive().default(1),
});

export const ALLOWED_COUNTRIES: Array<{ code: (typeof ALLOWED_COUNTRY_CODES)[number]; name: string }> = [
  { code: "PK", name: "Pakistan" },
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "SA", name: "Saudi Arabia" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "NL", name: "Netherlands" },
  { code: "SE", name: "Sweden" },
  { code: "NO", name: "Norway" },
  { code: "DK", name: "Denmark" },
  { code: "CH", name: "Switzerland" },
  { code: "SG", name: "Singapore" },
  { code: "MY", name: "Malaysia" },
  { code: "BD", name: "Bangladesh" },
  { code: "IN", name: "India" },
];

export type AddressInput = z.infer<typeof addressSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
