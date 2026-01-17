'use client';

import { AnimatePresence, motion, PanInfo } from 'framer-motion';
import Image from 'next/image';
import { CSSProperties, useCallback, useEffect } from 'react';

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

  const handleDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const threshold = 50;
      if (info.offset.x < -threshold && !showBack) {
        setShowBack(true);
      } else if (info.offset.x > threshold && showBack) {
        setShowBack(false);
      }
    },
    [showBack],
  );

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

  // Mobile: single card with swipe/tap to toggle
  return (
    <div className="flex flex-col items-center gap-3">
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        className="touch-pan-y"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={showBack ? 'back' : 'front'}
            initial={{ opacity: 0, x: showBack ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: showBack ? -20 : 20 }}
            transition={{ duration: 0.15 }}
            className="flex flex-col items-center gap-2"
          >
            <span className="font-mono text-xs uppercase tracking-widest text-stone-500">
              {showBack ? 'BACK' : 'FRONT'}
            </span>
            {cardImage(showBack ? 'back' : 'front')}
          </motion.div>
        </AnimatePresence>
      </motion.div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="View front"
          onClick={() => setShowBack(false)}
          className={cn(
            'size-2 rounded-full transition-colors',
            !showBack ? 'bg-stone-600' : 'bg-stone-300',
          )}
        />
        <button
          type="button"
          aria-label="View back"
          onClick={() => setShowBack(true)}
          className={cn(
            'size-2 rounded-full transition-colors',
            showBack ? 'bg-stone-600' : 'bg-stone-300',
          )}
        />
      </div>
    </div>
  );
}
