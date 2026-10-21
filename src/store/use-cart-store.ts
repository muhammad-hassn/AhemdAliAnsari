"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "@/types";

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (productId: string, size: string) => void;
  updateQuantity: (productId: string, size: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getSubtotalPkr: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      addItem: (item, quantity = 1) =>
        set((state) => {
          const existingIndex = state.items.findIndex(
            (i) => i.productId === item.productId && i.size === item.size,
          );
          if (existingIndex > -1) {
            const updated = [...state.items];
            const currentItem = updated[existingIndex];
            if (currentItem) {
              updated[existingIndex] = {
                ...currentItem,
                quantity: currentItem.quantity + quantity,
              };
            }
            return { items: updated, isOpen: true };
          }
          return {
            items: [...state.items, { ...item, quantity }],
            isOpen: true,
          };
        }),
      removeItem: (productId, size) =>
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.productId === productId && i.size === size),
          ),
        })),
      updateQuantity: (productId, size, quantity) =>
        set((state) => {
          if (quantity <= 0) {
            return {
              items: state.items.filter(
                (i) => !(i.productId === productId && i.size === size),
              ),
            };
          }
          return {
            items: state.items.map((i) =>
              i.productId === productId && i.size === size
                ? { ...i, quantity }
                : i,
            ),
          };
        }),
      clearCart: () => set({ items: [] }),
      getTotalItems: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },
      getSubtotalPkr: () => {
        return get().items.reduce(
          (sum, item) => sum + item.price_pkr * item.quantity,
          0,
        );
      },
    }),
    {
      name: "zahra-cart-storage",
      partialize: (state) => ({ items: state.items }),
    },
  ),
);
