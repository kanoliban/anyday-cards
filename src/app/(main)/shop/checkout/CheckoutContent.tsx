'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowLeft, Loader2, ShoppingBag, Sparkles } from 'lucide-react';

import Button from '~/src/components/ui/Button';
import Heading from '~/src/components/ui/Heading';
import Image from '~/src/components/ui/Image';

import { getItemPrice } from '../models';
import { useCartStore } from '../store';

function formatPrice(price: number): string {
  return `$${price.toFixed(2)}`;
}

export default function CheckoutContent() {
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const subtotal = useCartStore((state) => state.getSubtotal());
  const clearCart = useCartStore((state) => state.clearCart);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center py-20 text-center">
        <ShoppingBag className="mb-4 size-16 text-text-secondary/50" />
        <Heading className="mb-2 text-2xl">Your cart is empty</Heading>
        <p className="mb-6 text-text-secondary">
          Add some cards to your cart before checking out.
        </p>
        <Button asChild>
          <Link href="/shop">Browse Cards</Link>
        </Button>
      </div>
    );
  }

  async function handleCheckout() {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/checkout/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((item) => ({
            cardId: item.card.id,
            variant: item.variant,
            quantity: item.quantity,
            ...(item.customization && { customization: item.customization }),
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      if (data.url) {
        // Store cart state for potential restoration on cancel
        // Cart will be cleared on success page after payment confirmation
        window.location.href = data.url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      <Link
        href="/shop"
        className="mb-6 inline-flex items-center gap-2 text-sm text-text-secondary transition-colors hover:text-text-primary"
      >
        <ArrowLeft className="size-4" />
        Back to Shop
      </Link>

      <Heading className="mb-8 text-2xl md:text-3xl">Review Your Order</Heading>

      <div className="mb-8 divide-y rounded-lg border border-panel-border bg-panel">
        {items.map((item, index) => {
          const itemTotal = getItemPrice(item);
          return (
            <div
              key={item.customization ? `custom-${index}` : `${item.card.id}-${item.variant}`}
              className="flex gap-4 p-4"
            >
              <div className="relative size-20 shrink-0 overflow-hidden rounded-md bg-stone-100">
                <Image
                  src={item.card.src}
                  alt={item.card.name}
                  fill
                  sizes="80px"
                  className="object-contain p-2"
                />
              </div>
              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-text-primary">
                      {item.card.name}
                    </h4>
                    {item.customization && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                        <Sparkles className="size-3" />
                        Personalized
                      </span>
                    )}
                  </div>
                  <p className="text-sm capitalize text-text-secondary">
                    {item.variant} × {item.quantity}
                  </p>
                  {item.customization && (
                    <p className="text-xs text-text-secondary">
                      For {item.customization.recipientName}
                    </p>
                  )}
                </div>
                <p className="font-medium tabular-nums text-text-primary">
                  {formatPrice(itemTotal)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mb-8 rounded-lg border border-panel-border bg-panel p-4">
        <div className="flex items-center justify-between text-lg">
          <span className="text-text-secondary">Subtotal</span>
          <span className="font-semibold tabular-nums text-text-primary">
            {formatPrice(subtotal)}
          </span>
        </div>
        <p className="mt-2 text-sm text-text-secondary">
          Shipping and taxes calculated at checkout.
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      <Button
        onClick={handleCheckout}
        disabled={isLoading}
        className="w-full"
        variant="secondary"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" />
            Redirecting to payment...
          </>
        ) : (
          'Proceed to Payment'
        )}
      </Button>

      <p className="mt-4 text-center text-xs text-text-secondary">
        Secure checkout powered by Stripe
      </p>
    </div>
  );
}
