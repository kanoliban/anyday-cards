'use client';

import { Minus, Plus, Sparkles, Trash2 } from 'lucide-react';

import Image from '~/src/components/ui/Image';

import { CartItem, getItemPrice } from '../models';
import { useCartStore } from '../store';

type Props = {
  item: CartItem;
  index: number;
};

function formatPrice(price: number): string {
  return `$${price.toFixed(2)}`;
}

export default function CartItemRow({ item, index }: Props) {
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const setItems = useCartStore((state) => state.setItems);

  const { card, variant, quantity, customization } = item;
  const itemTotal = getItemPrice(item);
  const isCustomized = !!customization;

  function handleRemove() {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  }

  function handleUpdateQuantity(newQuantity: number) {
    if (isCustomized) return; // Customized cards don't allow quantity changes
    if (newQuantity <= 0) {
      handleRemove();
      return;
    }
    updateQuantity(card.id, variant, newQuantity);
  }

  return (
    <div className="flex gap-4 py-4">
      <div className="relative size-20 shrink-0 overflow-hidden rounded-md bg-stone-100">
        <Image
          src={card.src}
          alt={card.name}
          fill
          sizes="80px"
          className="object-contain p-2"
        />
        {isCustomized && (
          <div className="absolute bottom-1 right-1 rounded-full bg-text-primary p-1">
            <Sparkles className="size-3 text-panel-background" />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-between">
        <div>
          <h4 className="font-medium text-text-primary">{card.name}</h4>
          <p className="text-sm text-text-secondary capitalize">
            {variant}
            {isCustomized && (
              <span className="ml-1 text-xs">• Personalized</span>
            )}
          </p>
          {customization && (
            <p className="mt-1 line-clamp-1 text-xs text-text-muted">
              For {customization.recipientName}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between">
          {isCustomized ? (
            <span className="text-sm text-text-muted">Qty: 1</span>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleUpdateQuantity(quantity - 1)}
                className="flex size-7 items-center justify-center rounded-full bg-panel-overlay text-text-secondary transition-colors hover:bg-panel-overlay/80"
                aria-label="Decrease quantity"
              >
                <Minus className="size-4" />
              </button>
              <span className="w-8 text-center tabular-nums text-text-primary">
                {quantity}
              </span>
              <button
                onClick={() => handleUpdateQuantity(quantity + 1)}
                className="flex size-7 items-center justify-center rounded-full bg-panel-overlay text-text-secondary transition-colors hover:bg-panel-overlay/80"
                aria-label="Increase quantity"
              >
                <Plus className="size-4" />
              </button>
            </div>
          )}

          <div className="flex items-center gap-3">
            <span className="font-medium tabular-nums text-text-primary">
              {formatPrice(itemTotal)}
            </span>
            <button
              onClick={handleRemove}
              className="text-text-secondary transition-colors hover:text-red-500"
              aria-label="Remove item"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
