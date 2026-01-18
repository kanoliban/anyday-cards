'use client';

import { motion, PanInfo, useMotionValue } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useRef, useState } from 'react';

import { cn } from '~/src/util';

type CardData = {
  id: string;
  src: string;
  x: number;
  y: number;
  rotate: number;
  z: number;
};

const initialCards: CardData[] = [
  { id: '1', src: '/cards/australia.jpeg', x: 8, y: 12, rotate: -6, z: 1 },
  { id: '2', src: '/cards/ghana.jpeg', x: 55, y: 8, rotate: 4, z: 2 },
  { id: '3', src: '/cards/vatican.jpeg', x: 30, y: 40, rotate: -2, z: 3 },
  { id: '4', src: '/cards/sweden.jpeg', x: 65, y: 35, rotate: 5, z: 4 },
  { id: '5', src: '/cards/great-britain.jpeg', x: 12, y: 58, rotate: -4, z: 5 },
  { id: '6', src: '/cards/monaco.jpeg', x: 50, y: 55, rotate: 3, z: 6 },
];

function DraggableCard({
  card,
  onDragStart,
  containerRef,
}: {
  card: CardData;
  onDragStart: (id: string) => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
}) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  return (
    <motion.div
      drag
      dragMomentum={false}
      dragElastic={0.1}
      dragConstraints={containerRef}
      onDragStart={() => onDragStart(card.id)}
      style={{
        x,
        y,
        left: `${card.x}%`,
        top: `${card.y}%`,
        rotate: card.rotate,
        zIndex: card.z,
      }}
      whileDrag={{ scale: 1.05, cursor: 'grabbing' }}
      whileHover={{ scale: 1.02 }}
      className="absolute h-[38%] w-[28%] cursor-grab touch-none"
    >
      <div className="relative h-full w-full overflow-hidden rounded border-2 border-white bg-white shadow-md">
        <Image
          alt=""
          src={card.src}
          fill
          className="object-cover"
          sizes="120px"
          draggable={false}
        />
      </div>
    </motion.div>
  );
}

export default function MiniCanvas({ className }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [cards, setCards] = useState(initialCards);
  const [hasInteracted, setHasInteracted] = useState(false);

  const bringToFront = (id: string) => {
    setHasInteracted(true);
    setCards((prev) => {
      const maxZ = Math.max(...prev.map((c) => c.z));
      return prev.map((c) => (c.id === id ? { ...c, z: maxZ + 1 } : c));
    });
  };

  return (
    <div className={cn('relative', className)}>
      <div
        ref={containerRef}
        className="relative aspect-[4/3] overflow-hidden rounded-md bg-stone-100"
      >
        {cards.map((card) => (
          <DraggableCard
            key={card.id}
            card={card}
            onDragStart={bringToFront}
            containerRef={containerRef}
          />
        ))}

        {/* Hint overlay - fades after interaction */}
        <div
          className={cn(
            'pointer-events-none absolute inset-0 flex items-center justify-center transition-opacity duration-500',
            hasInteracted ? 'opacity-0' : 'opacity-100',
          )}
        >
          <span className="rounded-full bg-white/80 px-3 py-1.5 text-xs font-medium text-stone-500 shadow-sm">
            Drag to explore
          </span>
        </div>
      </div>

      {/* Link to full experience */}
      <Link
        href="/cards"
        className="mt-3 flex items-center justify-center gap-1 text-sm text-theme-1 transition-colors hover:text-theme-2"
      >
        <span>Open full collection</span>
        <span aria-hidden>→</span>
      </Link>
    </div>
  );
}
