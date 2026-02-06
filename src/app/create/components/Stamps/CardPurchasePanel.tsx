'use client';

import { motion } from 'framer-motion';
import { Sparkles, ZoomIn, ZoomOut } from 'lucide-react';
import { Fragment, useState } from 'react';

import { cn } from '~/src/util';

import { collections } from '../../constants';
import type { Card, CardVariant } from '../../models';
import { useCardStore } from '../../store';

const metadataKeys = ['occasion', 'style', 'tone', 'colors', 'size', 'paperStock'] as const;

const metadataLabels: Record<(typeof metadataKeys)[number], string> = {
  occasion: 'Occasion',
  style: 'Style',
  tone: 'Tone',
  colors: 'Colors',
  size: 'Size',
  paperStock: 'Paper Stock',
};

interface CardPurchasePanelProps {
  card?: Card;
  className?: string;
  onPersonalize?: () => void;
  showWizardCta?: boolean;
  showZoomToggle?: boolean;
}

export function CardPurchasePanel({
  card: cardProp,
  className,
  onPersonalize,
  showWizardCta = true,
  showZoomToggle = false,
}: CardPurchasePanelProps) {
  const [variant, setVariant] = useState<CardVariant>('digital');
  const startWizard = useCardStore((s) => s.startWizard);
  const toggleZoomed = useCardStore((s) => s.toggleZoomed);
  const zoomEnabled = useCardStore((s) => s.zoomEnabled);
  const isZoomed = useCardStore((s) => s.isZoomed);
  const selectedCardId = useCardStore((s) => s.selectedCardId);
  const collection = useCardStore((s) => s.collection);
  const wizardMode = useCardStore((s) => s.wizardMode);

  // Use prop if provided, otherwise get from store
  const card = cardProp ?? (selectedCardId
    ? collections[collection]?.cards.find((c) => c.id === selectedCardId) as Card | undefined
    : undefined);

  if (!card) return null;

  const price = variant === 'physical' ? card.pricing.physical : card.pricing.digital;
  const zoomLabel = isZoomed ? 'Exit zoom' : 'Zoom in';

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

      {wizardMode ? (
        /* Card Metadata (shown when wizard is active) */
        <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 font-mono text-xs">
          {metadataKeys.map((key) => {
            const value = card[key];
            const displayValue = Array.isArray(value) ? value.join(', ') : String(value ?? '--');
            return (
              <Fragment key={key}>
                <span className="font-bold uppercase tracking-wide text-stone-400">
                  {metadataLabels[key]}
                </span>
                <span className="uppercase text-stone-600">
                  {displayValue}
                </span>
              </Fragment>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {showWizardCta && (
            <button
              onClick={() => {
                startWizard();
                onPersonalize?.();
              }}
              className={cn(
                'flex w-full items-center justify-center gap-2 rounded-md px-4 py-3',
                'bg-stone-800 text-white',
                'font-mono text-sm font-bold uppercase tracking-wide',
                'transition-colors hover:bg-stone-700',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-500 focus-visible:ring-offset-2'
              )}
            >
              <Sparkles className="size-4" />
              <span>Write the message</span>
            </button>
          )}
          {showZoomToggle && (
            <button
              onClick={() => toggleZoomed()}
              disabled={!zoomEnabled}
              className={cn(
                'flex w-full items-center justify-center gap-2 rounded-md border px-4 py-2',
                'border-stone-300 bg-white text-stone-700',
                'font-mono text-xs font-semibold uppercase tracking-wide',
                'transition-colors hover:border-stone-500 hover:text-stone-900',
                'disabled:cursor-not-allowed disabled:opacity-50'
              )}
            >
              {isZoomed ? <ZoomOut className="size-4" /> : <ZoomIn className="size-4" />}
              <span>{zoomLabel}</span>
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
}

export default CardPurchasePanel;
