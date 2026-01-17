'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { CSSProperties } from 'react';

import { cn } from '~/src/util';

import { Card } from '../../models';

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

  const imageStyle = {
    '--width': card.width || defaultDimensions.width,
    '--height': card.height || defaultDimensions.height,
    '--size-scale': sizeScale,
  } as CSSProperties;

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
        <Image
          data-slot="card-image"
          src={card.src}
          alt={`${card.name} - Front`}
          width={card.width || defaultDimensions.width}
          height={card.height || defaultDimensions.height}
          priority
          loading="eager"
          style={imageStyle}
          className={cn(
            'pointer-events-none h-auto w-[calc(var(--size-scale)*var(--width)*1px)] object-contain object-center drop-shadow transition-all duration-200',
          )}
        />
      </div>

      <div className="flex flex-col items-center gap-2">
        <span className="font-mono text-xs uppercase tracking-widest text-stone-500">
          BACK
        </span>
        <Image
          src={card.srcBack || card.src}
          alt={`${card.name} - Back`}
          width={card.width || defaultDimensions.width}
          height={card.height || defaultDimensions.height}
          priority
          loading="eager"
          style={imageStyle}
          className={cn(
            'pointer-events-none h-auto w-[calc(var(--size-scale)*var(--width)*1px)] object-contain object-center drop-shadow transition-all duration-200',
          )}
        />
      </div>
    </motion.div>
  );
}
