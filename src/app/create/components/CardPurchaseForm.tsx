'use client';

import { useState } from 'react';

import Button from '~/src/components/ui/Button';
import { cn } from '~/src/util';

import { useCartStore } from '../../(main)/shop/store';
import type { Card, CardVariant } from '../models';

type Props = {
  card: Card;
  className?: string;
};

export default function CardPurchaseForm({ card, className }: Props) {
  const [variant, setVariant] = useState<CardVariant>('digital');
  const [mode, setMode] = useState<'buy' | 'customize'>('buy');
  const [added, setAdded] = useState(false);

  const addItem = useCartStore((s) => s.addItem);
  const setCartOpen = useCartStore((s) => s.setOpen);

  function handleAddToCart() {
    addItem(card, variant);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
    setCartOpen(true);
  }

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {/* Mode toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setMode('buy')}
          className={cn(
            'flex-1 rounded-lg border px-4 py-2 text-sm font-medium transition-colors',
            mode === 'buy'
              ? 'border-text-primary bg-text-primary text-panel-background'
              : 'border-theme-2 text-text-secondary hover:border-text-primary',
          )}
        >
          Buy As-Is
        </button>
        <button
          disabled
          className="flex-1 cursor-not-allowed rounded-lg border border-theme-2 px-4 py-2 text-sm font-medium text-text-secondary opacity-50"
        >
          Customize
          <span className="ml-1 text-xs">(Soon)</span>
        </button>
      </div>

      {mode === 'buy' && (
        <>
          {/* Variant selection */}
          <div className="flex flex-col gap-2">
            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-theme-2 p-3 transition-colors hover:border-text-secondary">
              <input
                type="radio"
                name="variant"
                value="physical"
                checked={variant === 'physical'}
                onChange={() => setVariant('physical')}
                className="size-4 accent-text-primary"
              />
              <div className="flex flex-1 items-center justify-between">
                <div>
                  <div className="font-medium text-text-primary">Physical Card</div>
                  <div className="text-sm text-text-secondary">
                    Printed on {card.paperStock}, shipped to you
                  </div>
                </div>
                <div className="font-medium text-text-primary">
                  ${card.pricing.physical.toFixed(2)}
                </div>
              </div>
            </label>

            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-theme-2 p-3 transition-colors hover:border-text-secondary">
              <input
                type="radio"
                name="variant"
                value="digital"
                checked={variant === 'digital'}
                onChange={() => setVariant('digital')}
                className="size-4 accent-text-primary"
              />
              <div className="flex flex-1 items-center justify-between">
                <div>
                  <div className="font-medium text-text-primary">Digital Download</div>
                  <div className="text-sm text-text-secondary">
                    High-res PDF, instant delivery
                  </div>
                </div>
                <div className="font-medium text-text-primary">
                  ${card.pricing.digital.toFixed(2)}
                </div>
              </div>
            </label>
          </div>

          {/* Add to cart button */}
          <Button
            onClick={handleAddToCart}
            className="w-full justify-center py-3"
          >
            {added ? 'Added!' : 'Add to Cart'}
          </Button>
        </>
      )}
    </div>
  );
}
