'use client';

import { AnimatePresence, motion, MotionProps, PanInfo, Transition } from 'framer-motion';
import Image from 'next/image';
import React, {
  ComponentProps,
  CSSProperties,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import FocusLock from 'react-focus-lock';
import colors from 'tailwindcss/colors';

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '~/src/components/ui/Drawer';
import useMatchMedia from '~/src/hooks/useMatchMedia';
import { randInt } from '~/src/math';
import { cn, preloadImage } from '~/src/util';

import { collections, CollectionType } from '../../constants';
import { Card } from '../../models';
import { useCardStore } from '../../store';
import CanvasGrid from '../CanvasGrid';
import CollectionsList from '../CollectionsList';
import MetadataTable from '../MetadataTable';
import { DrawnActionButton } from './ActionButton';
import DrawnInfo from './actions/info.svg';
import DrawnOrganize from './actions/organize.svg';
import DrawnShuffle from './actions/shuffle.svg';
import DrawnZoom from './actions/zoom.svg';
import { DoubleSidedCard } from './DoubleSidedCard';
import Draggable, { DraggableController } from './Draggable';
import { FeedbackDialog } from './Feedback';
import { Footer } from './Footer';
import Loupe from './Loupe';
import { PunchPattern } from './PunchPattern';
import { computeGridArrangement, useIsMobile } from './util';

interface DragContainerRef {
  e: HTMLElement;
  z: number;
  dragging: boolean;
}

const cardInitial = {
  opacity: 0,
  z: 1,
};

const invertScale = (scale: number) => {
  return 1 / scale;
};

const cardDefaultDimensions = { width: 175, height: 245 };
const dragContainerPadding = { top: 70, right: 20 };

const fadeInProps: MotionProps = {
  initial: 'initial',
  animate: 'animate',
  exit: 'exit',
  variants: {
    initial: ({ i = 0 } = {}) => ({
      opacity: 0,
      filter: 'blur(4px)',
      y: 10,
      transition: { delay: i * 0.05 },
    }),
    animate: ({ i = 0, scale = 1 } = {}) => ({
      opacity: 1,
      filter: 'blur(0px)',
      y: 0,
      scale,
      transition: { delay: i * 0.05 },
    }),
    exit: ({ i = 0 } = {}) => ({
      opacity: 0,
      filter: 'blur(4px)',
      y: -10,
      transition: { delay: i * 0.05 },
    }),
  },
};

const MemoizedDraggable = memo(Draggable);

const cardTransition: Transition = { type: 'spring', stiffness: 500, damping: 80 };
const cardDragTransition: Transition = { bounceStiffness: 100, bounceDamping: 10, power: 0.4 };

const getAttribute = (e: { dataset: DOMStringMap } | null, attribute: string) => {
  if (!e) {
    return null;
  }

  const value = e.dataset[attribute];

  return value || null;
};

const getIndexAttribute = (e: { dataset: DOMStringMap } | null) => {
  const index = getAttribute(e, 'index');
  const n = Number(index);
  if (!Number.isFinite(n)) {
    return null;
  }

  return n;
};

const getIdAttribute = (e: { dataset: DOMStringMap } | null) => getAttribute(e, 'id');

const directionKeys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'];

export default function Cards({ className, ...props }: ComponentProps<typeof motion.div>) {
  const store = useCardStore();
  const selectedCardId = useCardStore((s) => s.selectedCardId);
  const collectionKey = useCardStore((s) => s.collection);
  const setZoomEnabled = useCardStore((s) => s.setZoomEnabled);
  const setSelectedCardId = useCardStore((s) => s.setSelectedCardId);

  const collection = collections[collectionKey];
  const cards: Card[] = collection.cards;

  const isMobile = useIsMobile(false);
  const isMobileSmall = useMatchMedia('(max-width: 639px)', false);

  const centerScale = isMobile ? 2 : 1.5;

  const [drawerOpen, setDrawerOpen] = useState(false);

  const selectedCard = useMemo(
    () => cards.find((card) => card.id === selectedCardId) as Card,
    [cards, selectedCardId],
  );

  useEffect(() => {
    if (selectedCard?.srcLg) {
      preloadImage(selectedCard.srcLg);
    }
    if (selectedCard?.srcBack) {
      preloadImage(selectedCard.srcBack);
    }
    if (selectedCard?.srcLgBack) {
      preloadImage(selectedCard.srcLgBack);
    }
  }, [selectedCard?.srcLg, selectedCard?.srcBack, selectedCard?.srcLgBack]);

  const draggableContainerRefs = useRef(new Map<string, DragContainerRef>());
  const draggableControllerRefs = useRef(new Map<string, DraggableController>());

  const focusedCardIdRef = useRef<string | null>(null);
  const selectedCardIdRef = useRef<string | null>(null);
  const selectedCardContainerRef = useRef<HTMLElement | null>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);
  const cardsDragContainerRef = useRef<HTMLDivElement>(null);

  // const { ref: containerRef, dimensions } = useResizeRef<HTMLDivElement>();
  const containerRef = useRef<HTMLDivElement>(null);

  const getMaxZ = useCallback(() => {
    return Math.max(...Array.from(draggableContainerRefs.current.values()).map(({ z }) => z)) + 1;
  }, [draggableContainerRefs]);

  const compactZIndices = useCallback(
    (activeId?: string) => {
      const entries = Array.from(draggableContainerRefs.current.entries());
      if (!entries.length) return;

      entries.sort(([, a], [, b]) => a.z - b.z);

      let nextZ = 1;
      for (const [id, target] of entries) {
        if (activeId && id === activeId) {
          continue;
        }
        target.z = nextZ;
        target.e?.style.setProperty('--z', String(nextZ));
        nextZ++;
      }

      if (activeId) {
        const active = draggableContainerRefs.current.get(activeId);
        if (active) {
          const topZ = entries.length + 1;
          active.z = topZ;
          active.e?.style.setProperty('--z', String(topZ));
        }
      }
    },
    [draggableContainerRefs],
  );

  const placeOnTop = useCallback(
    (id: string, forceZ?: number) => {
      const target = draggableContainerRefs.current.get(id);
      if (!target?.e) {
        return;
      }

      const newZ = forceZ ?? getMaxZ();

      target.e.style.setProperty('--z', newZ.toString());
      target.z = newZ;

      const maxZ = draggableContainerRefs.current.size + 1;

      if (newZ > maxZ) {
        compactZIndices(id);
      }

      return newZ;
    },
    [draggableContainerRefs, getMaxZ, compactZIndices],
  );

  const focusById = useCallback((id: string | null) => {
    if (!id) {
      return;
    }

    const el = draggableContainerRefs.current.get(id)?.e;
    if (!el) {
      return;
    }

    el.focus();
    focusedCardIdRef.current = id;
  }, []);

  const getIndexById = useCallback(
    (id: string | null | undefined) => {
      if (!id) {
        return null;
      }
      return cards.findIndex((card) => card.id === id);
    },
    [cards],
  );

  const getNextFocusId = useCallback(
    (nextIndex: number) => {
      if (!cards.length) {
        return null;
      }
      if (nextIndex < 0) {
        return cards.at(-1)?.id ?? null;
      }
      if (nextIndex >= cards.length) {
        return cards[0]?.id ?? null;
      }
      return cards[nextIndex]?.id ?? null;
    },
    [cards],
  );

  const handleOrganize = useCallback(() => {
    const container = cardsDragContainerRef.current;
    if (!container) {
      return;
    }

    const childrenById = Object.fromEntries(
      cards.flatMap((card) => {
        const e = draggableContainerRefs.current.get(card.id)?.e;
        return e
          ? [[card.id, { width: e.clientWidth, height: e.clientHeight, id: card.id }]]
          : [];
      }),
    );

    const paddingX = 12;
    const paddingY = 12;
    const gap = 12;

    const positions = computeGridArrangement({
      container,
      children: Object.values(childrenById),
      paddingX,
      paddingY,
      gap,
    });

    let i = 0;
    const maxZ = getMaxZ();

    for (const pos of positions.values()) {
      const draggable = draggableControllerRefs.current.get(pos.id);
      const container = draggableContainerRefs.current.get(pos.id);
      if (!draggable || !container) {
        continue;
      }

      const { width, height } = childrenById[pos.id]!;
      const left = pos.x - width / 2;
      const top = pos.y - height / 2;

      placeOnTop(pos.id, maxZ + i);
      i++;

      draggable.controls.start({
        x: left,
        y: top + dragContainerPadding.top,
        rotate: pos.fit ? randInt(-5, 5) : randInt(-35, 35),
        transition: { type: 'spring', stiffness: 500, damping: 80 },
      });
    }
  }, [
    draggableContainerRefs,
    draggableControllerRefs,
    cardsDragContainerRef,
    cards,
    getMaxZ,
    placeOnTop,
  ]);

  const handleDragStart = useCallback(
    (e: MouseEvent | PointerEvent | TouchEvent, info: PanInfo) => {
      const id = getIdAttribute(e.target as HTMLElement);
      if (id === null) {
        return;
      }

      const target = draggableContainerRefs.current.get(id);
      if (!target) {
        return;
      }

      const newMaxI = placeOnTop(id);

      draggableContainerRefs.current.set(id, {
        ...target,
        z: newMaxI || 1,
        dragging: true,
      });
    },
    [placeOnTop],
  );

  const handleDragEnd = useCallback(
    (e: MouseEvent | PointerEvent | TouchEvent, info: PanInfo) => {
      const id = getIdAttribute(e.target as HTMLElement);
      if (id === null) {
        return;
      }

      const target = draggableContainerRefs.current.get(id);
      if (!target) {
        return;
      }

      draggableContainerRefs.current.set(id, {
        ...target,
        dragging: false,
      });
    },
    [draggableContainerRefs],
  );

  const handleDragTransitionEnd = useCallback(() => {
    for (const [index, target] of draggableContainerRefs.current.entries()) {
      if (target.dragging) {
        draggableContainerRefs.current.set(index, {
          ...target,
          dragging: false,
        });
      }
    }
  }, []);

  const handleSpreadOut = useCallback(
    async ({ stagger = 5 }: { stagger?: number }) => {
      let i = 0;

      for (const card of cards) {
        const draggable = draggableControllerRefs.current.get(card.id);
        if (!draggable) {
          continue;
        }

        if (draggable.id === selectedCardIdRef.current) {
          continue;
        }

        await new Promise((resolve) => setTimeout(resolve, i * stagger));
        draggable.spreadOut({
          container: cardsDragContainerRef.current!,
          dist: 500,
          padding: 50,
        });

        i++;
      }
    },
    [draggableControllerRefs, cardsDragContainerRef, cards],
  );

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    handleSpreadOut({ stagger: 5 });
  }, [collectionKey, containerRef, handleSpreadOut]);

  const handleSelectCard = useCallback(
    (id: string) => {
      const target = draggableContainerRefs.current.get(id);
      if (target?.dragging) {
        return;
      }

      const focusedId = selectedCardIdRef.current;
      if (focusedId && focusedId !== id) {
        draggableControllerRefs.current.get(focusedId!)?.unfocus();
      }

      placeOnTop(id);
      draggableControllerRefs.current.get(id)?.center(containerRef.current!, centerScale);

      if (!target?.dragging) {
        setZoomEnabled(true);
        setSelectedCardId(id);

        selectedCardIdRef.current = id;
        selectedCardContainerRef.current = target?.e ?? null;

        draggableContainerRefs.current.get(id)?.e?.focus();
      }
    },
    [
      draggableContainerRefs,
      draggableControllerRefs,
      containerRef,
      setZoomEnabled,
      setSelectedCardId,
      centerScale,
      placeOnTop,
    ],
  );

  const handleDeselectCard = useCallback(
    (e?: React.MouseEvent<HTMLDivElement>) => {
      if (!selectedCardIdRef.current) {
        return;
      }

      store.reset();

      const focused = selectedCardIdRef?.current;
      if (focused) {
        draggableControllerRefs.current.get(focused!)?.unfocus();
        selectedCardIdRef.current = null;

        placeOnTop(focused!);
      }
    },
    [store, draggableControllerRefs, placeOnTop],
  );

  useEffect(() => {
    const focusWithinRef = containerRef.current?.contains(document.activeElement);
    if (!focusWithinRef) {
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedCardId) {
        if (e.key === 'Escape') {
          if (store.isZoomed) {
            store.setZoomed(false);
          } else {
            handleDeselectCard();
          }
          return;
        }

        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
          const direction = e.key === 'ArrowLeft' ? -1 : 1;
          const selectedIndex = cards.findIndex((card) => card.id === selectedCardId);
          const nextIndex = (selectedIndex + direction + cards.length) % cards.length;
          const nextId = cards[nextIndex].id;

          handleSelectCard(nextId);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    selectedCardId,
    handleDeselectCard,
    handleSpreadOut,
    store,
    containerRef,
    cards,
    handleSelectCard,
  ]);

  const handleDragContainerRef = useCallback(
    (e: HTMLElement | null) => {
      const id = getIdAttribute(e);
      if (id === null) {
        return;
      }

      draggableContainerRefs.current.set(id, {
        z: 1,
        e: e!,
        dragging: false,
      });
    },
    [draggableContainerRefs],
  );

  const handleDraggableControllerRef = useCallback(
    (e: DraggableController) => {
      if (!e) {
        return;
      }
      draggableControllerRefs.current.set(e.id!, e);
    },
    [draggableControllerRefs],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const id = getIdAttribute(e.currentTarget);
      if (id === null || id === selectedCardId) {
        return;
      }

      if (e.target !== e.currentTarget) {
        return;
      }

      if (e.key === 'Enter' || e.key === ' ') {
        handleSelectCard(id);
      }
    },
    [handleSelectCard, selectedCardId],
  );

  const handleCardClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const id = getIdAttribute(e.currentTarget);
      if (id === null || id === selectedCardId) {
        return;
      }

      if (e.target !== e.currentTarget) {
        return;
      }

      e.stopPropagation();

      handleSelectCard(id);

      store.setZoomed(false);
    },
    [handleSelectCard, store, selectedCardId],
  );

  const handleContainerClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) {
        handleDeselectCard();
      }
    },
    [handleDeselectCard],
  );

  const handlePreloadCollection = useCallback((c: CollectionType) => {
    const collection = collections[c];
    for (const card of collection.cards) {
      preloadImage(card.src);
    }
  }, []);

  const handleSelectCollection = useCallback(
    (c: CollectionType) => {
      handlePreloadCollection(c);
      if (selectedCardId) {
        handleDeselectCard();
      }
      store.setCollection(c as CollectionType);
    },
    [handlePreloadCollection, handleDeselectCard, store, selectedCardId],
  );

  const handleListKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const count = cards.length;
      if (!count) {
        return;
      }

      if (directionKeys.includes(e.key)) {
        e.preventDefault();
        e.stopPropagation();
      }

      const i = getIndexById(focusedCardIdRef.current);
      if (e.key === 'Home') {
        focusById(cards[0]?.id ?? null);
        return;
      }
      if (e.key === 'End') {
        focusById(cards.at(-1)?.id ?? null);
        return;
      }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        const nextId = getNextFocusId((i ?? 0) - 1);
        focusById(nextId);
        return;
      }
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        const nextId = getNextFocusId((i ?? 0) + 1);
        focusById(nextId);
        return;
      }
    },
    [cards, getNextFocusId, focusById, getIndexById],
  );

  const handleListFocus = useCallback(
    (e: React.FocusEvent<HTMLDivElement>) => {
      if (e.target !== cardsContainerRef.current) {
        return;
      }

      const firstId = focusedCardIdRef.current ?? cards[0]?.id ?? null;
      focusById(firstId);

      if (cardsContainerRef.current) {
        cardsContainerRef.current.tabIndex = -1;
      }
    },
    [focusById, cards],
  );

  const handleListBlur = useCallback((e: React.FocusEvent<HTMLDivElement>) => {
    const related = e.relatedTarget;

    if (!cardsContainerRef.current) {
      return;
    }
    if (!related || !cardsContainerRef.current.contains(related)) {
      cardsContainerRef.current.tabIndex = 0;
    }
  }, []);

  const handleCardFocusReturn = useCallback(() => {
    if (!focusedCardIdRef.current || selectedCardIdRef.current) {
      return;
    }
    setTimeout(() => {
      focusById(focusedCardIdRef.current);
    }, 0);
  }, [focusById]);

  const gridCellSize = isMobile ? 16 : 32;

  const showCollectionActions = Boolean(!selectedCardId);

  return (
    <motion.div
      className={cn(
        'group/cards-container grid h-full grid-cols-[1fr_auto] grid-rows-[auto_auto_1fr] bg-stone-100 lg:grid-cols-[56px_1fr_auto] lg:grid-rows-[1fr_auto] lg:py-5',
        {
          'touch-none': selectedCardId,
        },
        className,
      )}
      {...props}
    >
      <div className="col-[1/3] row-1 flex-col items-center justify-center border-b border-dashed border-stone-300 lg:col-1 lg:flex lg:border-b-0">
        <PunchPattern className={cn('flex-row px-2 py-4 lg:flex-col lg:px-0 lg:py-0')} />
      </div>
      <div
        data-vaul-no-drag
        className={cn('relative row-3 flex h-full items-start lg:row-1')}
        ref={containerRef}
        onClick={handleContainerClick}
      >
        <div
          className={cn(
            'pointer-events-none absolute inset-0 top-1/2 left-1/2 z-0 h-full w-full -translate-x-1/2 -translate-y-1/2 overflow-clip border border-solid border-stone-300 duration-500 select-none',
          )}
        >
          <CanvasGrid
            background={colors.stone[100]}
            foreground={colors.stone[300]}
            cellWidth={gridCellSize}
            cellHeight={gridCellSize}
            align="top"
            className={cn('absolute inset-0 opacity-40 lg:opacity-100')}
          />
        </div>
        <div
          className="pointer-events-none absolute inset-0 transform-gpu focus-visible:outline-none"
          ref={cardsContainerRef}
          role="list"
          tabIndex={0}
          aria-label={`${collectionKey} Cards List`}
          onFocus={handleListFocus}
          onBlur={handleListBlur}
          onKeyDown={handleListKeyDown}
        >
          <div
            className="card-drag-container pointer-events-none absolute bottom-0 left-0"
            style={dragContainerPadding}
            ref={cardsDragContainerRef}
            role="presentation"
            aria-hidden="true"
          />

          {cards.map((card, index) => {
            return (
              <MemoizedDraggable
                key={card.id}
                dragDisabled={Boolean(selectedCardId)}
                ref={handleDragContainerRef}
                data-index={index}
                data-id={card.id}
                index={index}
                id={card.id}
                initial={cardInitial}
                transition={cardTransition}
                draggableControllerRef={handleDraggableControllerRef}
                role="listitem"
                aria-current={selectedCardId === card.id ? 'true' : undefined}
                tabIndex={-1}
                inert={store.isZoomed && selectedCardId !== card.id}
                onKeyDown={handleKeyDown}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragTransitionEnd={handleDragTransitionEnd}
                dragTransition={cardDragTransition}
                dragConstraints={cardsDragContainerRef}
                onClick={handleCardClick}
                data-slot="card-container"
                className={cn(
                  'focus-dashed group pointer-events-auto absolute z-(--z) flex items-center justify-center outline-offset-4 transition-[filter] duration-200 will-change-transform',
                  {
                    'opacity-40 blur-lg': selectedCardId && selectedCardId !== card.id,
                    'pointer-events-none': selectedCardId,
                  },
                )}
              >
                <FocusLock
                  disabled={selectedCardId !== card.id}
                  group={`card-${card.id}`}
                  onDeactivation={handleCardFocusReturn}
                >
                  <AnimatePresence>
                    {selectedCardId === card.id && (
                      <motion.div
                        {...fadeInProps}
                        key="card-actions"
                        custom={{
                          scale: invertScale(centerScale),
                        }}
                        className="pointer-events-auto absolute top-full flex w-full items-center justify-center gap-5 lg:top-[calc(100%+8px)]"
                      >
                        <motion.div {...fadeInProps} key="info-button" className="lg:hidden">
                          <Drawer
                            shouldScaleBackground={false}
                            onOpenChange={(open) => {
                              setDrawerOpen(open);
                              if (open) {
                                store.setZoomed(false);
                              }
                            }}
                            open={drawerOpen}
                          >
                            <AnimatePresence>
                              <DrawerTrigger asChild>
                                <DrawnActionButton disabled={!selectedCard}>
                                  <DrawnInfo className="w-[55px]" aria-label="Card Info" />
                                </DrawnActionButton>
                              </DrawerTrigger>
                            </AnimatePresence>

                            <DrawerContent
                              className="max-w-[100vw] rounded-none! border-none! bg-stone-100 shadow-[0_-2px_10px_0_rgba(0,0,0,0.05),0_-1px_6px_0_rgba(0,0,0,0.05)]"
                              handle={false}
                              overlayClassName="opacity-0!"
                            >
                              <div className="font-libertinus flex-1 overflow-y-auto pb-10">
                                <DrawerHeader className="sr-only">
                                  <DrawerTitle>{selectedCard?.name || 'Card Info'}</DrawerTitle>
                                  <DrawerDescription>
                                    {selectedCard?.occasion || ''}
                                  </DrawerDescription>
                                </DrawerHeader>
                                <PunchPattern className="sticky top-0 z-1 flex flex-row bg-stone-100 px-4 py-4" />
                                <div className="w-full border-b border-dashed border-stone-300"></div>
                                <div className="max-w-[100vw] p-5">
                                  {selectedCard && <MetadataTable />}
                                </div>
                              </div>
                            </DrawerContent>
                          </Drawer>
                        </motion.div>
                        <DrawnActionButton
                          disabled={!store.zoomEnabled}
                          onClick={() => store.toggleZoomed()}
                          {...fadeInProps}
                          key="toggle-zoom-button"
                          custom={{ i: 1 }}
                        >
                          <DrawnZoom
                            className={cn('w-[60px]', {
                              '[&_.plus-vertical]:hidden': store.isZoomed,
                            })}
                            aria-label="Toggle Zoom"
                          />
                        </DrawnActionButton>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </FocusLock>
                {selectedCardId === card.id && card.srcBack ? (
                  <DoubleSidedCard
                    card={card}
                    isMobile={isMobile}
                    isMobileSmall={isMobileSmall}
                    defaultDimensions={cardDefaultDimensions}
                  />
                ) : (
                  <Image
                    src={card.src}
                    alt={card.name || ''}
                    width={card.width || cardDefaultDimensions.width}
                    height={card.height || cardDefaultDimensions.height}
                    priority
                    loading="eager"
                    style={
                      {
                        '--width': card.width || cardDefaultDimensions.width,
                        '--height': card.height || cardDefaultDimensions.height,
                        '--size-scale': isMobileSmall ? 0.6 : isMobile ? 0.8 : 1,
                      } as CSSProperties
                    }
                    data-slot="card-image"
                    className={cn(
                      'pointer-events-none h-auto w-[calc(var(--size-scale)*var(--width)*1px)] object-contain object-center drop-shadow transition-all duration-200',
                    )}
                  />
                )}
              </MemoizedDraggable>
            );
          })}
        </div>
        <div
          className={cn('absolute top-8 left-1/2 z-50 flex -translate-x-1/2 items-center gap-5')}
        >
          <AnimatePresence mode="wait">
            {showCollectionActions && (
              <motion.div
                {...fadeInProps}
                key="collection-actions"
                className="flex items-center gap-5"
              >
                <DrawnActionButton
                  onClick={handleOrganize}
                  disabled={Boolean(selectedCardId)}
                  {...fadeInProps}
                  key="organize-button"
                >
                  <DrawnOrganize className="w-[95px]" aria-label="Organize Cards" />
                </DrawnActionButton>

                <DrawnActionButton
                  onClick={() => handleSpreadOut({ stagger: 3 })}
                  disabled={Boolean(selectedCardId)}
                  custom={{ i: 1 }}
                  {...fadeInProps}
                  key="shuffle-button"
                >
                  <DrawnShuffle className="w-[90px]" aria-label="Shuffle Cards" />
                </DrawnActionButton>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {selectedCard && (
          <FocusLock disabled={!store.isZoomed} returnFocus>
            <Loupe
              gridCellSize={gridCellSize}
              className={cn({
                'pointer-events-none': !store.isZoomed,
              })}
              baseScale={centerScale}
              key={selectedCard.id}
              selectedCard={selectedCard}
              dragConstraints={containerRef}
              activeCardContainerRef={selectedCardContainerRef}
            />
          </FocusLock>
        )}
      </div>
      <p id="cards-navigation-help" className="sr-only">
        Use Left/Right/Up/Down to move focus between cards. Home jumps to the first, End to the
        last. Press Space to open a card to see the details.
      </p>

      <div className="absolute top-[165px] right-0 row-3 w-8 lg:static lg:right-auto lg:row-1 lg:w-10">
        <CollectionsList
          className={cn(
            'absolute origin-bottom-left -translate-x-px -translate-y-8 rotate-90 group-[:has(div[data-state=open][data-slot=dialog-content])]/cards-container:blur-sm lg:-translate-y-10',
            {
              'blur-sm': selectedCardId,
            },
          )}
          collection={store.collection}
          onCollectionClick={handleSelectCollection}
          onCollectionMouseOver={(c) => handlePreloadCollection(c)}
          onCollectionFocus={(c) => handlePreloadCollection(c)}
        />
      </div>
      <Footer
        className="col-1 row-2 py-2 pl-2 sm:py-2 sm:pb-2 lg:col-2 lg:row-2 lg:pl-0"
        onSelectCollection={handleSelectCollection}
      />
      {/* Hidden for e-commerce focus
        <FeedbackDialog
          containerRef={containerRef}
          trigger={
            <button
              style={{
                '--shimmer-bg': colors.stone[400],
                '--shimmer-fg': colors.stone[500],
              } as CSSProperties}
              className="focus-dashed shimmer-text cursor-pointer font-mono uppercase lg:ml-0"
            >
              Give Feedback
            </button>
          }
        />
      */}
    </motion.div>
  );
}
