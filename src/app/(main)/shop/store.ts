import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { Card, CardVariant } from '~/src/app/create/models';

import { CardCustomization, CartItem, getCartItemKey, getItemPrice } from './models';

type CartState = {
  items: CartItem[];
  isOpen: boolean;
};

type CartActions = {
  addItem: (
    card: Card,
    variant: CardVariant,
    quantity?: number,
    customization?: CardCustomization,
  ) => void;
  removeItem: (cardId: string, variant: CardVariant, customization?: CardCustomization) => void;
  updateQuantity: (
    cardId: string,
    variant: CardVariant,
    quantity: number,
    customization?: CardCustomization,
  ) => void;
  setItems: (items: CartItem[]) => void;
  clearCart: () => void;
  setOpen: (open: boolean) => void;
  getItemCount: () => number;
  getSubtotal: () => number;
};

type CartStore = CartState & CartActions;

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (card, variant, quantity = 1, customization) => {
        set((state) => {
          // Customized cards are always unique (never stack)
          if (customization) {
            return {
              items: [...state.items, { card, variant, quantity, customization }],
            };
          }

          // Non-customized cards can stack
          const key = getCartItemKey(card.id, variant);
          const existingIndex = state.items.findIndex(
            (item) => !item.customization && getCartItemKey(item.card.id, item.variant) === key,
          );

          if (existingIndex >= 0) {
            const newItems = [...state.items];
            newItems[existingIndex] = {
              ...newItems[existingIndex],
              quantity: newItems[existingIndex].quantity + quantity,
            };
            return { items: newItems };
          }

          return {
            items: [...state.items, { card, variant, quantity }],
          };
        });
      },

      removeItem: (cardId, variant) => {
        set((state) => ({
          items: state.items.filter(
            (item) => getCartItemKey(item.card.id, item.variant) !== getCartItemKey(cardId, variant)
          ),
        }));
      },

      updateQuantity: (cardId, variant, quantity) => {
        if (quantity <= 0) {
          get().removeItem(cardId, variant);
          return;
        }

        set((state) => ({
          items: state.items.map((item) =>
            getCartItemKey(item.card.id, item.variant) === getCartItemKey(cardId, variant)
              ? { ...item, quantity }
              : item
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      setItems: (items) => set({ items }),

      setOpen: (open) => set({ isOpen: open }),

      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      getSubtotal: () => {
        return get().items.reduce((sum, item) => sum + getItemPrice(item), 0);
      },
    }),
    {
      name: 'anyday-cart',
      partialize: (state) => ({ items: state.items }),
    }
  )
);
