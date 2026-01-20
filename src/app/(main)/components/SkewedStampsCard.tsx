'use client';

import { ArrowRightIcon } from '@phosphor-icons/react';
import {
  motion,
  useAnimationControls,
  useMotionTemplate,
  useMotionValue,
  useMotionValueEvent,
  useSpring,
  useTransform,
} from 'framer-motion';
import { ReactLenis, useLenis } from 'lenis/react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

import Card1 from '~/public/cards/birthday-warm.svg';
import Card2 from '~/public/cards/birthday-playful.svg';
import Card3 from '~/public/cards/thankyou-elegant.svg';
import Card4 from '~/public/cards/congratulations-minimal.svg';
import Card5 from '~/public/cards/thinking-of-you.svg';
import Card6 from '~/public/cards/holiday-festive.svg';
import GridBackground from '~/src/components/GridBackground';
import CardTitle from '~/src/components/ui/CardTitle';
import useMatchMedia from '~/src/hooks/useMatchMedia';
import useResizeRef from '~/src/hooks/useResizeRef';
import { remap } from '~/src/math';
import { cn } from '~/src/util';

import Card from './Card';

interface SkewedCardProps {
  index: number;
  children: React.ReactNode;
  count: number;
  width: number;
  height: number;
  activeIndex?: number | null;
  className?: string;
  style?: React.CSSProperties;
  spacing?: number;
  containerWidth: number;
  containerHeight: number;
  onActivate?: (index: number | null) => void;
}

export function SkewedCard({
  index,
  children,
  count,
  width = 200,
  height = 200,
  activeIndex,
  className,
  style,
  containerWidth,
  containerHeight,
  onActivate,
}: SkewedCardProps) {
  const scrollProgress = useMotionValue(0);
  const animationControls = useAnimationControls();

  const isTouch = useMatchMedia('(pointer: coarse)');

  const cardOffset = index / count;
  const initialProgress = cardOffset % 1;
  const initialZIndex = Math.floor(initialProgress * count);
  const [relativeZIndex, setRelativeZIndex] = useState(initialZIndex);
  const scrolling = useRef(false);
  const scale = useMotionValue(1);
  const springScale = useSpring(scale, {
    stiffness: 100,
    damping: 10,
    mass: 0.5,
  });

  const loopedProgress = useTransform(scrollProgress, (p) => {
    const cardOffset = index / count;

    return (p + cardOffset) % 1;
  });

  useMotionValueEvent(loopedProgress, 'change', (latest) => {
    const relativeZIndex = Math.floor(latest * count);
    setRelativeZIndex(relativeZIndex);
  });

  const x = useTransform(loopedProgress, (p) => remap(p, 0, 1, containerWidth, -width - width / 2));

  const y = useTransform(loopedProgress, (p) =>
    remap(p, 0, 1, -height, containerHeight + height / 2),
  );

  const lenis = useLenis((lenis: any) => {
    if (isTouch) {
      scrollProgress.set(1 - lenis.progress);
    } else {
      scrollProgress.set(lenis.progress);
    }

    scrolling.current = true;
    if (lenis.velocity < 0.1) {
      scrolling.current = false;
    }
  });

  const transform = useMotionTemplate`translate(${x}px, ${y}px) skewY(10deg) scale(${springScale})`;

  useEffect(() => {
    if (containerHeight > 0) {
      lenis?.scrollTo(200, {
        duration: 5,
      });

      animationControls.start({
        opacity: 1,
        filter: 'blur(0px)',
        transition: {
          delay: 0.05 * index,
          duration: 0.05 * index,
        },
      });
    }
  }, [containerWidth, containerHeight, index, animationControls, lenis]);

  return (
    <motion.div
      className={cn('absolute', className)}
      animate={animationControls}
      style={{
        height,
        width,
        top: -height / 2,
        zIndex: relativeZIndex,
        transform,
        opacity: 0,
        filter: 'blur(2px)',
        ...style,
      }}
      onHoverStart={() => {
        onActivate?.(index);
      }}
      onHoverEnd={() => {
        onActivate?.(null);
      }}
    >
      {children}
    </motion.div>
  );
}

export function Cards({ width, height }: { width: number; height: number }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const numCards = 12;

  const cards = [Card1, Card2, Card3, Card4, Card5, Card6];

  return (
    <div className="relative h-full w-full">
      <ReactLenis
        className="scrollbar-none max-h-[420px] w-full overflow-hidden rounded-lg"
        options={{
          infinite: true,
          syncTouch: true,
          syncTouchLerp: 0.2,
          duration: 2,
        }}
      >
        <div className="h-[1000px] w-full" />
        <div className="absolute top-0 right-0 mx-auto flex h-full w-full flex-col items-center overflow-hidden rounded-lg">
          {Array.from({ length: numCards }).map((_, i) => {
            const CardSvg = cards[i % cards.length];
            return (
              <SkewedCard
                activeIndex={activeIndex}
                index={i}
                count={numCards}
                key={i}
                width={140}
                height={196}
                containerWidth={width}
                containerHeight={height}
                onActivate={setActiveIndex}
                className="flex items-center justify-center"
              >
                <CardSvg
                  className={cn(
                    '[--background:var(--theme-3)] [--foreground-muted:var(--text-primary)]',
                    'in-[.theme-dark]:[--background:var(--theme-1)] in-[.theme-dark]:[--foreground-muted:var(--theme-3)] in-[.theme-dark]:[--foreground:var(--theme-3)] in-[.theme-dark]:[--outline:var(--theme-2)]',
                    'h-auto w-[140px] drop-shadow-sm',
                  )}
                />
              </SkewedCard>
            );
          })}
        </div>
      </ReactLenis>
    </div>
  );
}

export default function SkewedCardsCard() {
  const { ref, dimensions } = useResizeRef<HTMLDivElement>();

  return (
    <Card id="cards">
      <div className="flex flex-col gap-4">
        <CardTitle variant="mono">
          <Link
            href="/create"
            className="group flex w-full items-center justify-between gap-2 rounded-md"
          >
            <span>Card Collection</span>
            <ArrowRightIcon className="inline h-4 w-4" />
          </Link>
        </CardTitle>
        <div
          className="relative h-full min-h-[240px] w-full overflow-auto rounded-md xl:min-h-[420px]"
          ref={ref}
        >
          <GridBackground className="absolute top-0 left-0 h-full w-full" n={300} />
          <Cards width={dimensions.width} height={dimensions.height} />
        </div>
        <p className="text-text-primary text-sm">
          Beautiful greeting cards for life&apos;s everyday moments. From birthdays to thank you
          notes, find the perfect card for any occasion.
        </p>
      </div>
    </Card>
  );
}
