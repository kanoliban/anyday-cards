'use client';

import { AnimatePresence, motion, useAnimation } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import colors from 'tailwindcss/colors';

import { clamp, randInt } from '~/src/math';
import { cn } from '~/src/util';

import { cards as allCards, CollectionType, collectionTypes } from '~/src/app/cards/constants';
import type { Card } from '~/src/app/cards/models';
import CanvasGrid from '~/src/app/cards/components/CanvasGrid';
import CardPurchasePanel from '~/src/app/cards/components/Stamps/CardPurchasePanel';
import { useCardStore } from '~/src/app/cards/store';
import CollectionsList from '~/src/app/cards/components/CollectionsList';
import { PunchPattern } from '~/src/app/cards/components/Stamps/PunchPattern';
import { Footer } from '~/src/app/cards/components/Stamps/Footer';
import { DrawnActionButton } from '~/src/app/cards/components/Stamps/ActionButton';
import DrawnOrganize from '~/src/app/cards/components/Stamps/actions/organize.svg';
import DrawnShuffle from '~/src/app/cards/components/Stamps/actions/shuffle.svg';

// Sample 6 cards from different collections for variety
const sampleCards = [
  allCards.find((c) => c.id === 'australia-birthday'),
  allCards.find((c) => c.id === 'ghana-celebration'),
  allCards.find((c) => c.id === 'great-britain-thanks'),
  allCards.find((c) => c.id === 'sweden-thanks'),
  allCards.find((c) => c.id === 'vatican-milestone'),
  allCards.find((c) => c.id === 'monaco-victory'),
].filter(Boolean);

type CardState = {
  id: string;
  z: number;
};

const cardTransition = { type: 'spring', stiffness: 500, damping: 80 } as const;
const dragTransition = { bounceStiffness: 100, bounceDamping: 10, power: 0.4 } as const;

function DraggableCard({
  card,
  index,
  cardState,
  onDragStart,
  onCardClick,
  containerRef,
  targetPosition,
}: {
  card: (typeof sampleCards)[number];
  index: number;
  cardState: CardState;
  onDragStart: (id: string) => void;
  onCardClick: (card: Card) => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
  targetPosition?: { x: number; y: number; rotate: number } | null;
}) {
  const controls = useAnimation();
  const cardRef = useRef<HTMLDivElement>(null);
  const hasDragged = useRef(false);
  const hasInitialized = useRef(false);

  // Calculate responsive card size based on aspect ratio
  const baseWidth = 140; // px (increased from 80)
  const aspect = card?.aspect ?? 0.85;
  const cardWidth = baseWidth;
  const cardHeight = baseWidth / aspect;

  // Spread out animation on mount
  useEffect(() => {
    if (hasInitialized.current) return;

    const container = containerRef.current;
    const el = cardRef.current;
    if (!container || !el) return;

    const containerRect = container.getBoundingClientRect();
    const dist = 140;

    // Padding to avoid UI elements: punch (left), tabs (right), buttons (top), footer (bottom)
    const paddingLeft = 30;   // punch pattern
    const paddingRight = 50;  // collection tabs
    const paddingTop = 55;    // organize/shuffle buttons
    const paddingBottom = 50; // footer

    // Start from center
    const centerX = containerRect.width / 2 - cardWidth / 2;
    const centerY = containerRect.height / 2 - cardHeight / 2;

    // Calculate spread bounds
    const minX = paddingLeft;
    const maxX = containerRect.width - cardWidth - paddingRight;
    const minY = paddingTop;
    const maxY = containerRect.height - cardHeight - paddingBottom;

    // Staggered animation
    const delay = index * 30;

    setTimeout(() => {
      controls.start({
        x: clamp(minX, maxX, centerX + randInt(-dist, dist)),
        y: clamp(minY, maxY, centerY + randInt(-dist, dist)),
        rotate: randInt(-15, 15),
        opacity: 1,
        transition: cardTransition,
      });
      hasInitialized.current = true;
    }, delay);
  }, [controls, containerRef, index, cardWidth, cardHeight]);

  // Animate to target position when organize is triggered
  useEffect(() => {
    if (targetPosition) {
      controls.start({
        x: targetPosition.x,
        y: targetPosition.y,
        rotate: targetPosition.rotate,
        transition: cardTransition,
      });
    }
  }, [controls, targetPosition]);

  if (!card) return null;

  return (
    <motion.div
      ref={cardRef}
      drag
      dragMomentum={true}
      dragElastic={0.1}
      dragConstraints={containerRef}
      dragTransition={dragTransition}
      onDragStart={() => {
        hasDragged.current = true;
        onDragStart(card.id);
      }}
      onDragEnd={() => {
        // Reset after a small delay to allow click to fire first if it's a click
        setTimeout(() => {
          hasDragged.current = false;
        }, 0);
      }}
      onClick={() => {
        if (!hasDragged.current) {
          onCardClick(card);
        }
      }}
      animate={controls}
      initial={{ opacity: 0, x: '50%', y: '50%', rotate: 0 }}
      transition={cardTransition}
      whileDrag={{ scale: 1.08, cursor: 'grabbing' }}
      whileHover={{ scale: 1.05 }}
      style={{ zIndex: cardState.z }}
      className="absolute cursor-pointer touch-none"
    >
      <div
        className="relative overflow-hidden rounded border-2 border-white bg-white shadow-md"
        style={{ width: cardWidth, height: cardHeight }}
      >
        <Image
          alt={card.name}
          src={card.src}
          fill
          className="object-cover"
          sizes="140px"
          draggable={false}
        />
      </div>
    </motion.div>
  );
}

export default function MiniCanvas({ className }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const setSelectedCardId = useCardStore((s) => s.setSelectedCardId);
  const setCollection = useCardStore((s) => s.setCollection);
  const collection = useCardStore((s) => s.collection);

  const [cardStates, setCardStates] = useState<Map<string, CardState>>(() => {
    const map = new Map<string, CardState>();
    sampleCards.forEach((card, i) => {
      if (card) {
        map.set(card.id, { id: card.id, z: i + 1 });
      }
    });
    return map;
  });
  const [hasInteracted, setHasInteracted] = useState(false);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [targetPositions, setTargetPositions] = useState<Map<string, { x: number; y: number; rotate: number }> | null>(null);

  const bringToFront = (id: string) => {
    setHasInteracted(true);
    setCardStates((prev) => {
      const newMap = new Map(prev);
      const maxZ = Math.max(...Array.from(newMap.values()).map((c) => c.z));
      const current = newMap.get(id);
      if (current) {
        newMap.set(id, { ...current, z: maxZ + 1 });
      }
      return newMap;
    });
  };

  const handleCardClick = (card: Card) => {
    setHasInteracted(true);
    setSelectedCard(card);
  };

  const handleOrganize = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    setHasInteracted(true);
    const cols = 3;
    const gap = 12;
    const baseWidth = 140;

    // Use same padding as spread bounds
    const paddingLeft = 35;
    const paddingTop = 60;

    const newPositions = new Map<string, { x: number; y: number; rotate: number }>();

    sampleCards.forEach((card, i) => {
      if (!card) return;
      const col = i % cols;
      const row = Math.floor(i / cols);
      const cardHeight = baseWidth / (card.aspect ?? 0.85);
      const x = paddingLeft + col * (baseWidth + gap);
      const y = paddingTop + row * (cardHeight + gap);
      newPositions.set(card.id, { x, y, rotate: 0 });
    });

    setTargetPositions(newPositions);
  }, []);

  const handleShuffle = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    setHasInteracted(true);
    const rect = container.getBoundingClientRect();
    const baseWidth = 140;
    const dist = 140;

    // Same padding as initial spread
    const paddingLeft = 30;
    const paddingRight = 50;
    const paddingTop = 55;
    const paddingBottom = 50;

    const centerX = rect.width / 2 - baseWidth / 2;
    const centerY = rect.height / 2 - baseWidth / 2;
    const minX = paddingLeft;
    const maxX = rect.width - baseWidth - paddingRight;
    const minY = paddingTop;
    const maxY = rect.height - baseWidth - paddingBottom;

    const newPositions = new Map<string, { x: number; y: number; rotate: number }>();

    sampleCards.forEach((card) => {
      if (!card) return;
      const cardHeight = baseWidth / (card.aspect ?? 0.85);
      const cardMaxY = rect.height - cardHeight - paddingBottom;
      newPositions.set(card.id, {
        x: clamp(minX, maxX, centerX + randInt(-dist, dist)),
        y: clamp(minY, cardMaxY, centerY + randInt(-dist, dist)),
        rotate: randInt(-15, 15),
      });
    });

    setTargetPositions(newPositions);
  }, []);

  const handleCollectionClick = useCallback((c: CollectionType) => {
    setCollection(c);
  }, [setCollection]);

  return (
    <div className={cn('relative', className)}>
      <div
        ref={containerRef}
        className="relative aspect-[4/3] overflow-hidden rounded-md border-l border-stone-300"
      >
        {/* Canvas grid background */}
        <CanvasGrid
          background={colors.stone[100]}
          foreground={colors.stone[300]}
          cellWidth={16}
          cellHeight={16}
          align="top"
          className="absolute inset-0 opacity-40"
        />

        {/* Organize / Shuffle buttons — top center */}
        <div className="absolute top-3 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3">
          <DrawnActionButton onClick={handleOrganize} disabled={!!selectedCard}>
            <DrawnOrganize className="w-[70px]" aria-label="Organize Cards" />
          </DrawnActionButton>
          <DrawnActionButton onClick={handleShuffle} disabled={!!selectedCard}>
            <DrawnShuffle className="w-[65px]" aria-label="Shuffle Cards" />
          </DrawnActionButton>
        </div>

        {/* Punch pattern — left side */}
        <div className="pointer-events-none absolute left-1 top-1/2 z-10 -translate-y-1/2">
          <PunchPattern className="scale-75" />
        </div>

        {/* Collection tabs — right side (rotated) */}
        <div className="absolute top-[80px] right-0 z-10 w-6">
          <CollectionsList
            className="absolute origin-bottom-left -translate-x-px -translate-y-6 rotate-90 scale-[0.6]"
            collection={collection}
            onCollectionClick={handleCollectionClick}
            onCollectionMouseOver={() => {}}
            onCollectionFocus={() => {}}
          />
        </div>

        {/* Cards */}
        {sampleCards.map((card, index) => {
          if (!card) return null;
          const cardState = cardStates.get(card.id);
          if (!cardState) return null;

          return (
            <DraggableCard
              key={card.id}
              card={card}
              index={index}
              cardState={cardState}
              onDragStart={bringToFront}
              onCardClick={handleCardClick}
              containerRef={containerRef}
              targetPosition={targetPositions?.get(card.id)}
            />
          );
        })}

        {/* Hint overlay - fades after interaction */}
        <AnimatePresence>
          {!hasInteracted && !selectedCard && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="pointer-events-none absolute inset-0 flex items-center justify-center"
            >
              <span className="rounded-full bg-white/80 px-3 py-1.5 text-xs font-medium text-stone-500 shadow-sm">
                Drag to explore
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Card Selection Panel — reuses /cards page component */}
        <AnimatePresence>
          {selectedCard && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="absolute right-2 bottom-12 z-50"
            >
              <CardPurchasePanel
                card={selectedCard}
                className="w-[160px] scale-[0.85] origin-bottom-right"
                onPersonalize={() => {
                  setSelectedCardId(selectedCard.id);
                  setSelectedCard(null);
                  router.push('/cards');
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer — bottom */}
        <Footer
          className="absolute bottom-0 inset-x-0 z-20 px-2 scale-90 origin-bottom"
          onSelectCollection={handleCollectionClick}
        />
      </div>

      {/* Link to full experience */}
      <Link
        href="/cards"
        className="mt-2 flex items-center justify-center gap-1 text-sm text-theme-1 transition-colors hover:text-theme-2"
      >
        <span>Click around</span>
        <span aria-hidden>↑</span>
      </Link>
    </div>
  );
}
