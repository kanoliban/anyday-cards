'use client';

import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useState } from 'react';

import { cn } from '~/src/util';

import { collections } from '../../constants';
import type { Card, CardVariant } from '../../models';
import { useCardStore } from '../../store';

interface CardPurchasePanelProps {
  card?: Card;
  className?: string;
}

export function CardPurchasePanel({ card: cardProp, className }: CardPurchasePanelProps) {
  const [variant, setVariant] = useState<CardVariant>('digital');
  const startWizard = useCardStore((s) => s.startWizard);
  const selectedCardId = useCardStore((s) => s.selectedCardId);
  const collection = useCardStore((s) => s.collection);

  // Use prop if provided, otherwise get from store
  const card = cardProp ?? (selectedCardId
    ? collections[collection]?.cards.find((c) => c.id === selectedCardId) as Card | undefined
    : undefined);

  if (!card) return null;

  const price = variant === 'physical' ? card.pricing.physical : card.pricing.digital;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'rounded-lg bg-white p-4 shadow-lg',
        'border border-stone-200',
        'min-w-[280px]',
        className
      )}
    >
      {/* Card Name */}
      <h3 className="font-libertinus mb-3 text-lg font-medium text-stone-800">
        {card.name}
      </h3>

      {/* Price */}
      <div className="mb-3 flex items-baseline gap-2">
        <span className="font-mono text-xs font-bold uppercase tracking-wide text-stone-400">
          Price
        </span>
        <span className="font-mono text-lg font-bold text-stone-800">
          ${price.toFixed(2)}
        </span>
      </div>

      {/* Format Tabs */}
      <div className="mb-4">
        <span className="mb-2 block font-mono text-xs font-bold uppercase tracking-wide text-stone-400">
          Format
        </span>
        <div className="flex gap-1 rounded-md bg-stone-100 p-1">
          <button
            onClick={() => setVariant('physical')}
            className={cn(
              'flex-1 rounded px-3 py-2 font-mono text-xs font-medium uppercase tracking-wide transition-colors',
              variant === 'physical'
                ? 'bg-white text-stone-800 shadow-sm'
                : 'text-stone-500 hover:text-stone-700'
            )}
          >
            Physical
          </button>
          <button
            onClick={() => setVariant('digital')}
            className={cn(
              'flex-1 rounded px-3 py-2 font-mono text-xs font-medium uppercase tracking-wide transition-colors',
              variant === 'digital'
                ? 'bg-white text-stone-800 shadow-sm'
                : 'text-stone-500 hover:text-stone-700'
            )}
          >
            Digital
          </button>
        </div>
        <p className="mt-1 text-xs text-stone-400">
          {variant === 'physical'
            ? `Printed on ${card.paperStock}, shipped to you`
            : 'Instant PDF download'}
        </p>
      </div>

      {/* Make My Card Button */}
      <button
        onClick={startWizard}
        className={cn(
          'flex w-full items-center justify-center gap-2 rounded-md px-4 py-3',
          'bg-stone-800 text-white',
          'font-mono text-sm font-bold uppercase tracking-wide',
          'transition-colors hover:bg-stone-700',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-500 focus-visible:ring-offset-2'
        )}
      >
        <Sparkles className="size-4" />
        <span>Personalize with AI</span>
      </button>
    </motion.div>
  );
}

export default CardPurchasePanel;
