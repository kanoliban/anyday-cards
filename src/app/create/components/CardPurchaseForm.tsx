'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import Button from '~/src/components/ui/Button';
import {
  consumeQuickCreateDraft,
  peekQuickCreateDraft,
  QUICK_CREATE_DRAFT_CHANGED_EVENT,
  type QuickCreateDraft,
} from '~/src/lib/quick-create-draft';
import { cn } from '~/src/util';

import { useCartStore } from '../../(main)/shop/store';
import type { Card, CardVariant, WizardAnswers } from '../models';

const PERSONALIZATION_FEE = 2;

type Props = {
  card: Card;
  className?: string;
};

export default function CardPurchaseForm({ card, className }: Props) {
  const router = useRouter();
  const [variant, setVariant] = useState<CardVariant>('digital');
  const [mode, setMode] = useState<'buy' | 'customize'>('buy');
  const [added, setAdded] = useState(false);
  const [quickDraft, setQuickDraft] = useState<QuickCreateDraft | null>(null);

  const addItem = useCartStore((s) => s.addItem);
  const setCartOpen = useCartStore((s) => s.setOpen);

  useEffect(() => {
    const syncQuickDraft = () => {
      setQuickDraft(peekQuickCreateDraft());
    };

    syncQuickDraft();

    window.addEventListener(QUICK_CREATE_DRAFT_CHANGED_EVENT, syncQuickDraft);
    return () => {
      window.removeEventListener(QUICK_CREATE_DRAFT_CHANGED_EVENT, syncQuickDraft);
    };
  }, []);

  const hasQuickDraft = Boolean(quickDraft);

  const physicalPrice = card.pricing.physical + (hasQuickDraft ? PERSONALIZATION_FEE : 0);
  const digitalPrice = card.pricing.digital + (hasQuickDraft ? PERSONALIZATION_FEE : 0);

  function handleAddToCart() {
    const activeDraft = peekQuickCreateDraft();

    if (activeDraft) {
      addItem(card, variant, 1, {
        recipientName: activeDraft.recipientName,
        relationship: activeDraft.relationship,
        occasion: activeDraft.occasion,
        message: activeDraft.message,
        wizardAnswers: activeDraft.wizardAnswers as WizardAnswers,
        generatedAt: activeDraft.generatedAt,
      });
      consumeQuickCreateDraft();
      setQuickDraft(null);
    } else {
      addItem(card, variant);
    }

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
    setCartOpen(true);
  }

  function handleCustomize() {
    router.push(`/create?card=${card.id}`);
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
          onClick={handleCustomize}
          className="flex-1 rounded-lg border border-theme-2 px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:border-text-primary"
        >
          Customize
        </button>
      </div>

      {mode === 'buy' && (
        <>
          {quickDraft && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
              Using your generated message for {quickDraft.recipientName}. This applies once.
            </div>
          )}

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
                  ${physicalPrice.toFixed(2)}
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
                  ${digitalPrice.toFixed(2)}
                </div>
              </div>
            </label>
          </div>

          {/* Add to cart button */}
          <Button
            onClick={handleAddToCart}
            className="w-full justify-center py-3"
          >
            {added ? 'Added!' : hasQuickDraft ? 'Add Personalized Card' : 'Add to Cart'}
          </Button>
        </>
      )}
    </div>
  );
}
