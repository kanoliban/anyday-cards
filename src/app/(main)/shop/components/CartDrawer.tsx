'use client';

import Link from 'next/link';
import { ShoppingBag, X } from 'lucide-react';

import Button from '~/src/components/ui/Button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '~/src/components/ui/Drawer';

import { useCartStore } from '../store';
import CartItemRow from './CartItemRow';

function formatPrice(price: number): string {
  return `$${price.toFixed(2)}`;
}

export default function CartDrawer() {
  const isOpen = useCartStore((state) => state.isOpen);
  const setOpen = useCartStore((state) => state.setOpen);
  const items = useCartStore((state) => state.items);
  const subtotal = useCartStore((state) => state.getSubtotal());
  const itemCount = useCartStore((state) => state.getItemCount());

  return (
    <Drawer open={isOpen} onOpenChange={setOpen} direction="right">
      <DrawerContent className="sm:max-w-md">
        <DrawerHeader className="flex flex-row items-center justify-between border-b">
          <DrawerTitle className="flex items-center gap-2">
            <ShoppingBag className="size-5" />
            Cart ({itemCount})
          </DrawerTitle>
          <DrawerClose className="rounded-full p-2 transition-colors hover:bg-panel-overlay">
            <X className="size-5" />
            <span className="sr-only">Close cart</span>
          </DrawerClose>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <ShoppingBag className="mb-4 size-12 text-text-secondary/50" />
              <p className="text-lg font-medium text-text-primary">Your cart is empty</p>
              <p className="mt-1 text-sm text-text-secondary">
                Add some cards to get started
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {items.map((item, index) => (
                <CartItemRow
                  key={item.customization ? `custom-${index}` : `${item.card.id}-${item.variant}`}
                  item={item}
                  index={index}
                />
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <DrawerFooter className="border-t">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-text-secondary">Subtotal</span>
              <span className="text-xl font-semibold tabular-nums text-text-primary">
                {formatPrice(subtotal)}
              </span>
            </div>
            <Button asChild variant="secondary" className="w-full">
              <Link href="/shop/checkout">Checkout</Link>
            </Button>
            <DrawerClose asChild>
              <Button variant="text" className="w-full">
                Continue Shopping
              </Button>
            </DrawerClose>
          </DrawerFooter>
        )}
      </DrawerContent>
    </Drawer>
  );
}
