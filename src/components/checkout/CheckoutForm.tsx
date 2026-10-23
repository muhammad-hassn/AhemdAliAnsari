"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/store/use-cart-store";
import { useCurrencyStore } from "@/store/use-currency-store";
import { formatPrice } from "@/lib/format";
import { placeOrderAction } from "@/server/actions/checkout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ALLOWED_COUNTRIES } from "@/lib/validation/checkout";
import type { ShippingRate, PaymentMethod, Address } from "@/types";

interface CheckoutFormProps {
  initialEmail?: string;
  savedAddresses: Address[];
  shippingRates: ShippingRate[];
  paymentMethods: PaymentMethod[];
}

export function CheckoutForm({
  initialEmail = "",
  savedAddresses,
  shippingRates,
  paymentMethods,
}: CheckoutFormProps) {
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const currency = useCurrencyStore((state) => state.currency);

  const [email, setEmail] = useState(initialEmail);
  const [phone, setPhone] = useState(savedAddresses[0]?.phone ?? "");
  const [fullName, setFullName] = useState(savedAddresses[0]?.full_name ?? "");
  const [line1, setLine1] = useState(savedAddresses[0]?.line1 ?? "");
  const [line2, setLine2] = useState(savedAddresses[0]?.line2 ?? "");
  const [city, setCity] = useState(savedAddresses[0]?.city ?? "");
  const [state, setState] = useState(savedAddresses[0]?.state ?? "");
  const [postalCode, setPostalCode] = useState(savedAddresses[0]?.postal_code ?? "");
  const [countryCode, setCountryCode] = useState(savedAddresses[0]?.country_code ?? "PK");
  const [customerNote, setCustomerNote] = useState("");

  const [paymentOption, setPaymentOption] = useState<"full" | "deposit">("full");
  const [selectedMethodCode, setSelectedMethodCode] = useState("bank_transfer");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter shipping rate based on country
  const isDomestic = countryCode === "PK";
  const matchedRate =
    shippingRates.find((r) => (isDomestic ? r.country_code === "PK" : r.country_code !== "PK")) ??
    shippingRates[0] ?? { rate_pkr: 0, estimated_days: "3-5 days" };

  const shippingPkr = matchedRate.rate_pkr;

  // Filter payment methods based on country (COD only for Pakistan)
  const availablePaymentMethods = paymentMethods.filter(
    (pm) => pm.allowed_countries.includes("*") || pm.allowed_countries.includes(countryCode),
  );

  // Compute client preview pricing
  const subtotalPkr = items.reduce((sum, item) => sum + item.price_pkr * item.quantity, 0);
  const totalPkr = subtotalPkr + shippingPkr;
  const depositAmountPkr = paymentOption === "deposit" ? Math.ceil(totalPkr * 0.5) : totalPkr;
  const balanceAmountPkr = totalPkr - depositAmountPkr;

  const pricing = {
    subtotal_pkr: subtotalPkr,
    shipping_pkr: shippingPkr,
    total_pkr: totalPkr,
    deposit_amount_pkr: depositAmountPkr,
    balance_amount_pkr: balanceAmountPkr,
  };

  const handleSelectSavedAddress = (addr: Address) => {
    setFullName(addr.full_name);
    setPhone(addr.phone);
    setLine1(addr.line1);
    setLine2(addr.line2 ?? "");
    setCity(addr.city);
    setState(addr.state);
    setPostalCode(addr.postal_code);
    setCountryCode(addr.country_code);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      setError("Your shopping bag is empty.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await placeOrderAction({
        checkout: {
          email,
          phone,
          shipping_address: {
            label: "Shipping",
            full_name: fullName,
            phone,
            line1,
            line2: line2 || undefined,
            city,
            state,
            postal_code: postalCode,
            country_code: countryCode,
          },
          payment_method_code: selectedMethodCode,
          payment_option: paymentOption,
          customer_note: customerNote || undefined,
          currency_code: currency.code,
          currency_rate: currency.rate_from_pkr,
        },
        items,
        shippingRatePkr: shippingPkr,
      });

      if (res.ok && res.data) {
        clearCart();
        router.push(`/order/${res.data.orderNumber}?t=${res.data.accessToken}`);
      } else {
        setError(res.error || "Failed to place order.");
      }
    } catch {
      setError("An unexpected error occurred while placing your order.");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="py-20 text-center max-w-lg mx-auto">
        <h2 className="font-serif text-3xl text-ink mb-3">Your Shopping Bag is Empty</h2>
        <p className="text-xs text-stone mb-8">
          Please add bespoke handcrafted couture to your bag before proceeding to checkout.
        </p>
        <Link href="/shop">
          <Button variant="outline">Explore Collection</Button>
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
      {/* Left 7 Columns: Checkout Details Form */}
      <div className="lg:col-span-7 space-y-8">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-800 text-sm">
            {error}
          </div>
        )}

        {/* Saved Addresses quick-picker */}
        {savedAddresses.length > 0 && (
          <div className="p-5 bg-stone-light/20 border border-stone-light/60 space-y-3">
            <span className="text-xs uppercase tracking-wider text-ink font-medium block">
              Deliver to a Saved Address
            </span>
            <div className="flex flex-wrap gap-2">
              {savedAddresses.map((addr) => (
                <button
                  key={addr.id}
                  type="button"
                  onClick={() => handleSelectSavedAddress(addr)}
                  className="px-3 py-1.5 border border-stone-light text-xs font-sans text-ink hover:border-ink transition-colors bg-white cursor-pointer"
                >
                  {addr.label}: {addr.city} ({addr.country_code})
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Section 1: Contact Information */}
        <div className="space-y-4">
          <h2 className="font-serif text-2xl text-ink">1. Patron Contact</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-ink mb-1">
                Email Address
              </label>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ayesha@example.com"
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-ink mb-1">
                Phone Number
              </label>
              <Input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+92 300 1234567"
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Shipping Destination */}
        <div className="space-y-4">
          <h2 className="font-serif text-2xl text-ink">2. Delivery Address</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-ink mb-1">
                Recipient Full Name
              </label>
              <Input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ayesha Khan"
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-ink mb-1">
                Country / Region
              </label>
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="w-full h-10 px-3 border border-stone-light bg-ivory text-sm text-ink focus:outline-hidden"
              >
                {ALLOWED_COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-ink mb-1">
              Street Address
            </label>
            <Input
              type="text"
              required
              value={line1}
              onChange={(e) => setLine1(e.target.value)}
              placeholder="House, street, sector or apartment details"
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-ink mb-1">
              Apartment, Suite, Unit (Optional)
            </label>
            <Input
              type="text"
              value={line2}
              onChange={(e) => setLine2(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-ink mb-1">
                City
              </label>
              <Input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-ink mb-1">
                State / Province
              </label>
              <Input
                type="text"
                required
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-ink mb-1">
                Postal Code
              </label>
              <Input
                type="text"
                required
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Payment Terms */}
        <div className="space-y-4">
          <h2 className="font-serif text-2xl text-ink">3. Payment Terms</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              onClick={() => setPaymentOption("full")}
              className={`p-4 border cursor-pointer transition-all ${
                paymentOption === "full"
                  ? "border-ink bg-stone-light/30 ring-1 ring-ink"
                  : "border-stone-light bg-cream hover:border-stone"
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="font-serif text-base text-ink font-medium">Full Payment</span>
                <span className="text-xs font-sans text-emerald-800 bg-emerald-50 px-2 py-0.5">100% Settle</span>
              </div>
              <p className="text-xs text-stone leading-relaxed">
                Pay 100% of the invoice via manual bank transfer or standard payment. Smooth dispatch upon craftsmanship completion.
              </p>
            </div>

            <div
              onClick={() => {
                setPaymentOption("deposit");
                setSelectedMethodCode("bank_transfer");
              }}
              className={`p-4 border cursor-pointer transition-all ${
                paymentOption === "deposit"
                  ? "border-ink bg-stone-light/30 ring-1 ring-ink"
                  : "border-stone-light bg-cream hover:border-stone"
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="font-serif text-base text-ink font-medium">50% Advance + 50% COD</span>
                <span className="text-xs font-sans text-amber-800 bg-amber-50 px-2 py-0.5">50% Advance</span>
              </div>
              <p className="text-xs text-stone leading-relaxed">
                Pay 50% advance via manual bank transfer to commence atelier tailoring. The remaining 50% balance is collected in cash upon delivery.
              </p>
            </div>
          </div>
        </div>

        {/* Section 4: Payment Method */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-serif text-2xl text-ink">4. Payment Method</h2>
            {paymentOption === "deposit" && (
              <span className="text-xs text-amber-800 font-sans">
                Advance deposit is collected via Manual Bank Transfer
              </span>
            )}
          </div>

          <div className="space-y-3">
            {availablePaymentMethods.map((method) => {
              const isSelected = selectedMethodCode === method.code;
              return (
                <label
                  key={method.id}
                  className={`flex flex-col p-4 border cursor-pointer transition-colors ${
                    isSelected
                      ? "border-ink bg-stone-light/30 ring-1 ring-ink"
                      : "border-stone-light bg-cream hover:border-stone"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.code}
                      checked={isSelected}
                      onChange={() => setSelectedMethodCode(method.code)}
                      className="accent-ink"
                    />
                    <span className="font-sans text-sm font-medium text-ink">
                      {method.name}
                    </span>
                    {method.code === "bank_transfer" && (
                      <span className="text-[10px] uppercase font-sans tracking-wider bg-stone-100 text-stone-700 px-2 py-0.5 ml-auto border border-stone-200">
                        Manual Transfer + Receipt Upload
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone mt-2 pl-6 whitespace-pre-line leading-relaxed">
                    {method.instructions}
                  </p>
                </label>
              );
            })}
          </div>
        </div>

        {/* Section 5: Order Notes */}
        <div>
          <label className="block text-xs uppercase tracking-wider text-ink mb-1">
            Special Tailoring or Delivery Instructions (Optional)
          </label>
          <textarea
            rows={3}
            value={customerNote}
            onChange={(e) => setCustomerNote(e.target.value)}
            placeholder="e.g. Please hem shirt length to 44 inches or leave package at security."
            className="w-full p-3 border border-stone-light bg-ivory text-sm text-ink focus:outline-hidden"
          />
        </div>
      </div>

      {/* Right 5 Columns: Order Summary Card */}
      <div className="lg:col-span-5 bg-cream border border-stone-light/60 p-6 sm:p-8 space-y-6 lg:sticky lg:top-24">
        <div>
          <h2 className="font-serif text-2xl text-ink">Order Summary</h2>
          <p className="text-xs uppercase tracking-widest text-stone mt-1">
            {items.length} couture {items.length === 1 ? "piece" : "pieces"}
          </p>
        </div>

        {/* Item List */}
        <div className="space-y-4 max-h-72 overflow-y-auto divide-y divide-stone-light/40 pr-1">
          {items.map((item) => (
            <div key={`${item.productId}-${item.size}`} className="pt-3 first:pt-0 flex gap-4">
              <div className="relative w-16 h-20 bg-stone-light/20 shrink-0">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-serif text-sm text-ink truncate">{item.name}</p>
                <p className="text-xs text-stone mt-0.5">
                  Size: {item.size} × {item.quantity}
                </p>
                <p className="text-xs font-medium text-ink mt-1">
                  Rs. {(item.price_pkr * item.quantity).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Calculation breakdown */}
        <div className="border-t border-stone-light/60 pt-4 space-y-2 text-sm">
          <div className="flex justify-between text-stone">
            <span>Subtotal</span>
            <span className="text-ink font-medium">Rs. {pricing.subtotal_pkr.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-stone">
            <span>Shipping ({matchedRate.region_name})</span>
            <span className="text-ink font-medium">
              {pricing.shipping_pkr === 0
                ? "Complimentary"
                : `Rs. ${pricing.shipping_pkr.toLocaleString()}`}
            </span>
          </div>
          <div className="flex justify-between text-base font-medium text-ink pt-2 border-t border-stone-light/60">
            <span>Total Value</span>
            <span>Rs. {pricing.total_pkr.toLocaleString()}</span>
          </div>

          {/* Converted Reference */}
          {currency.code !== "PKR" && (
            <div className="text-[11px] text-stone text-right">
              Approx. {formatPrice(pricing.total_pkr, currency)} (charged in PKR)
            </div>
          )}

          {/* Deposit / Advance breakdown if applicable */}
          {paymentOption === "deposit" && (
            <div className="p-4 bg-amber-50/90 border border-amber-200/90 space-y-2 text-xs text-amber-950 mt-3">
              <div className="flex justify-between font-semibold border-b border-amber-200/60 pb-1.5">
                <span>50% Advance (Payable Now via Bank):</span>
                <span className="font-mono">Rs. {pricing.deposit_amount_pkr.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-stone-700">
                <span>Remaining 50% Balance (Cash on Delivery):</span>
                <span className="font-mono">Rs. {pricing.balance_amount_pkr.toLocaleString()}</span>
              </div>
              <p className="text-[11px] text-amber-800 pt-1 leading-normal">
                After placing this order, you will submit your bank transfer receipt & transaction ID for the 50% advance. The remaining balance is payable in cash upon courier delivery.
              </p>
            </div>
          )}
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full py-4 text-xs font-medium uppercase tracking-[0.15em]"
        >
          {loading
            ? "Authorizing Order..."
            : paymentOption === "deposit"
              ? `Place Order & Pay 50% Advance (Rs. ${pricing.deposit_amount_pkr.toLocaleString()})`
              : `Place Order (Rs. ${pricing.total_pkr.toLocaleString()})`}
        </Button>

        <p className="text-[10px] text-center text-stone leading-tight">
          By placing your order, you agree to Ahmed Ali Ansari&apos;s Terms of Service and Couture Policy.
        </p>
      </div>
    </form>
  );
}
