import { BASE_CURRENCY } from "@/lib/constants";
import type { CurrencyRate } from "@/types";

export function formatPrice(
  pricePkr: number,
  currencyOrCode: CurrencyRate | { code: string; rate_from_pkr: number; symbol: string } | string,
  rateFromPkr?: number,
  symbol?: string,
): string {
  const codeStr = typeof currencyOrCode === "string" ? currencyOrCode : currencyOrCode.code;
  const rate = typeof currencyOrCode === "object" ? currencyOrCode.rate_from_pkr : (rateFromPkr ?? 1);
  const sym = typeof currencyOrCode === "object" ? currencyOrCode.symbol : (symbol ?? (codeStr === "PKR" ? "Rs." : "$"));

  const amount = pricePkr * rate;
  const code = codeStr === BASE_CURRENCY ? "PKR" : codeStr;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: code,
    minimumFractionDigits: code === "PKR" ? 0 : 2,
    maximumFractionDigits: code === "PKR" ? 0 : 2,
  })
    .format(amount)
    .replace(/[A-Z]{3}\s?/, sym + " ");
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-PK", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

export function formatOrderStatus(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, " ");
}

export function formatPkr(amount: number): string {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

