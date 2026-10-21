"use client";

import Image from "next/image";
import Link from "next/link";
import { Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/use-cart-store";
import { Price } from "@/components/ui/Price";
import { Button } from "@/components/ui/Button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/Sheet";

export function CartDrawer() {
  const isOpen = useCartStore((state) => state.isOpen);
  const closeCart = useCartStore((state) => state.closeCart);
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const getSubtotalPkr = useCartStore((state) => state.getSubtotalPkr);
  const totalItems = useCartStore((state) => state.getTotalItems());

  const subtotal = getSubtotalPkr();

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent side="right" className="flex flex-col h-full w-full sm:max-w-md p-6">
        <SheetHeader className="pb-4">
          <SheetTitle className="flex items-center gap-2">
            <span>Shopping Bag</span>
            <span className="text-sm font-sans font-normal text-stone">
              ({totalItems})
            </span>
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 gap-4">
            <div className="h-16 w-16 border border-hairline flex items-center justify-center text-stone">
              <ShoppingBag className="h-8 w-8 stroke-[1.2]" />
            </div>
            <div className="space-y-1">
              <p className="font-heading text-2xl font-light text-ink">
                Your bag is empty
              </p>
              <p className="text-xs text-stone max-w-xs font-sans">
                Explore our curated bridal and formal ensembles to add handcrafted luxury to your collection.
              </p>
            </div>
            <Button
              variant="outline"
              size="default"
              onClick={closeCart}
              asChild
              className="mt-4"
            >
              <Link href="/shop">Explore Collections</Link>
            </Button>
          </div>
        ) : (
          <>
            {/* Items scroll area */}
            <div className="flex-1 overflow-y-auto divide-y divide-hairline -mx-6 px-6 py-2">
              {items.map((item) => (
                <div
                  key={`${item.productId}-${item.size}`}
                  className="py-5 flex gap-4 items-start"
                >
                  <div className="relative aspect-[2/3] w-20 shrink-0 overflow-hidden bg-[#EFE9DF] border border-hairline">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                    <div className="flex justify-between items-start gap-2">
                      <Link
                        href={`/product/${item.slug}`}
                        onClick={closeCart}
                        className="font-heading text-lg font-light text-ink hover:text-gold transition-colors line-clamp-1"
                      >
                        {item.name}
                      </Link>
                      <button
                        type="button"
                        onClick={() => removeItem(item.productId, item.size)}
                        aria-label="Remove item"
                        className="text-stone hover:text-burgundy transition-colors p-1"
                      >
                        <Trash2 className="h-3.5 w-3.5 stroke-[1.5]" />
                      </button>
                    </div>

                    <div className="text-[11px] font-sans uppercase tracking-[0.1em] text-stone">
                      Size: <span className="text-ink font-medium">{item.size}</span>
                    </div>

                    <Price
                      amountPkr={item.price_pkr}
                      className="text-xs text-ink pt-0.5"
                    />

                    {/* Quantity controls */}
                    <div className="flex items-center gap-3 pt-2">
                      <div className="inline-flex items-center border border-hairline">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(
                              item.productId,
                              item.size,
                              item.quantity - 1,
                            )
                          }
                          aria-label="Decrease quantity"
                          className="h-7 w-7 flex items-center justify-center text-ink hover:bg-hairline/40 transition-colors"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-8 text-center text-xs font-sans font-medium text-ink">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(
                              item.productId,
                              item.size,
                              item.quantity + 1,
                            )
                          }
                          aria-label="Increase quantity"
                          className="h-7 w-7 flex items-center justify-center text-ink hover:bg-hairline/40 transition-colors"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Subtotal & Checkout */}
            <div className="border-t border-hairline pt-5 flex flex-col gap-4">
              <div className="flex justify-between items-baseline">
                <span className="font-sans text-xs uppercase tracking-[0.12em] text-stone font-medium">
                  Subtotal
                </span>
                <Price amountPkr={subtotal} className="text-lg font-medium text-ink" />
              </div>

              <p className="text-[11px] text-stone font-sans">
                Taxes and complimentary domestic courier calculated at checkout.
              </p>

              <div className="flex flex-col gap-2">
                <Button
                  variant="solid"
                  size="lg"
                  className="w-full justify-center"
                  onClick={closeCart}
                  asChild
                >
                  <Link href="/checkout">Proceed to Checkout</Link>
                </Button>
                <Button
                  variant="outline"
                  size="default"
                  className="w-full justify-center"
                  onClick={closeCart}
                  asChild
                >
                  <Link href="/shop">Continue Shopping</Link>
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
