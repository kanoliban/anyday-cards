'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { CSSProperties, useEffect } from 'react';

import { cn } from '~/src/util';

import { Card } from '../../models';
import { useLoupeStore } from './Loupe/store';

interface DoubleSidedCardProps {
  card: Card;
  isMobile: boolean;
  isMobileSmall: boolean;
  defaultDimensions: { width: number; height: number };
}

export function DoubleSidedCard({
  card,
  isMobile,
  isMobileSmall,
  defaultDimensions,
}: DoubleSidedCardProps) {
  const sizeScale = isMobileSmall ? 0.6 : isMobile ? 0.8 : 1;
  const showBack = useLoupeStore((s) => s.showBackSide);
  const setShowBack = useLoupeStore((s) => s.setShowBackSide);

  // Reset to front when component mounts (new card selected)
  useEffect(() => {
    setShowBack(false);
  }, [card.id, setShowBack]);

  const imageStyle = {
    '--width': card.width || defaultDimensions.width,
    '--height': card.height || defaultDimensions.height,
    '--size-scale': sizeScale,
  } as CSSProperties;

  const cardImage = (side: 'front' | 'back') => (
    <Image
      data-slot={side === 'front' ? 'card-image' : undefined}
      src={side === 'front' ? card.src : card.srcBack || card.src}
      alt={`${card.name} - ${side === 'front' ? 'Front' : 'Back'}`}
      width={card.width || defaultDimensions.width}
      height={card.height || defaultDimensions.height}
      priority
      loading="eager"
      style={imageStyle}
      className={cn(
        'pointer-events-none h-auto w-[calc(var(--size-scale)*var(--width)*1px)] object-contain object-center drop-shadow transition-all duration-200',
      )}
    />
  );

  // Desktop: side-by-side layout
  if (!isMobile) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="flex items-start gap-4"
      >
        <div className="flex flex-col items-center gap-2">
          <span className="font-mono text-xs uppercase tracking-widest text-stone-500">
            FRONT
          </span>
          {cardImage('front')}
        </div>
        <div className="flex flex-col items-center gap-2">
          <span className="font-mono text-xs uppercase tracking-widest text-stone-500">
            BACK
          </span>
          {cardImage('back')}
        </div>
      </motion.div>
    );
  }

  // Mobile: single card with tap to flip
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-2">
        <span className="font-mono text-xs uppercase tracking-widest text-stone-500">
          {showBack ? 'BACK' : 'FRONT'}
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setShowBack(!showBack);
          }}
          className="pointer-events-auto relative z-50 rounded-full p-1 text-stone-500 transition-colors hover:bg-stone-100 active:bg-stone-200"
          aria-label="Flip card"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M17 1l4 4-4 4" />
            <path d="M3 11V9a4 4 0 0 1 4-4h14" />
            <path d="M7 23l-4-4 4-4" />
            <path d="M21 13v2a4 4 0 0 1-4 4H3" />
          </svg>
        </button>
      </div>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={showBack ? 'back' : 'front'}
          initial={{ opacity: 0, x: showBack ? 20 : -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: showBack ? -20 : 20 }}
          transition={{ duration: 0.15 }}
        >
          {cardImage(showBack ? 'back' : 'front')}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
