'use client';

import { AnimatePresence, motion, MotionProps, Variants } from 'framer-motion';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import FocusLock from 'react-focus-lock';

import Button from '~/src/components/ui/Button';
import { cn } from '~/src/util';

import CartButton from '../../(main)/shop/components/CartButton';
import { collections, CollectionType } from '../constants';
import { Card } from '../models';
import { useCardStore } from '../store';
import EmptyState from './EmptyState';
import CardWizard from './CardWizard';
import MetadataTable from './MetadataTable';

type TypingAnimationOptions = {
  text: string;
  speed?: number;
  delay?: number;
  splitter?: (t: string) => string[];
  onAnimationEnd?: () => void;
  disabled?: boolean;
};

const useTypingAnimation = ({
  text,
  speed = 50,
  delay = 0,
  splitter = (t) => [...t],
  onAnimationEnd,
  disabled,
}: TypingAnimationOptions) => {
  const [displayedText, setDisplayedText] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const delayedRef = useRef(false);

  const textParts = useMemo(() => splitter(text), [text, splitter]);

  useEffect(() => {
    if (disabled) {
      return;
    }

    if (currentIndex < textParts.length) {
      const timer = setTimeout(
        () => {
          delayedRef.current = true;

          setDisplayedText((prev) => [...prev, textParts[currentIndex]]);
          setCurrentIndex((prev) => prev + 1);
        },
        (delayedRef.current ? delay : 0) + speed + speed * (Math.random() - 0.5),
      );

      return () => clearTimeout(timer);
    }

    if (currentIndex === textParts.length && textParts.length > 0) {
      onAnimationEnd?.();
    }
  }, [textParts, currentIndex, speed, onAnimationEnd, disabled, delay]);

  return displayedText;
};

const AnimatedText = ({ text, className }: { text: string; className?: string }) => {
  const displayedText = useTypingAnimation({
    text: text || '',
    speed: 50,
  });

  return displayedText.map((text, i) => (
    <motion.span
      key={i}
      initial={{ opacity: 0, filter: 'blur(6px)' }}
      animate={{ opacity: 1, filter: 'blur(0px)' }}
      className={className}
    >
      {text}
    </motion.span>
  ));
};

const slideInVariants: Variants = {
  hidden: { opacity: 0, y: 10, filter: 'blur(4px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.5 },
  },
};

const fadeInProps: MotionProps = {
  initial: { opacity: 0, filter: 'blur(4px)' },
  animate: { opacity: 1, filter: 'blur(0px)' },
  exit: { opacity: 0, filter: 'blur(4px)' },
  transition: { duration: 0.35 },
};

export default function Description({ className }: { className?: string }) {
  const searchParams = useSearchParams();
  const selectedCardId = useCardStore((s) => s.selectedCardId);
  const collection = useCardStore((s) => s.collection);
  const wizardMode = useCardStore((s) => s.wizardMode);
  const startWizard = useCardStore((s) => s.startWizard);
  const setWizardMode = useCardStore((s) => s.setWizardMode);
  const selectCardForWizard = useCardStore((s) => s.selectCardForWizard);
  const [animate, setAnimate] = useState(false);
  const [animated, setAnimated] = useState(false);

  const card = selectedCardId
    ? (collections[collection].cards.find((c) => c.id === selectedCardId) as Card)
    : null;

  // Handle pre-selected card from URL param (e.g., /create?card=ghana-celebration)
  useEffect(() => {
    const cardId = searchParams.get('card');
    if (!cardId) return;

    // Find card across all collections and initialize atomically
    for (const [collectionKey, collectionData] of Object.entries(collections)) {
      const found = collectionData.cards.find((c) => c.id === cardId);
      if (found) {
        selectCardForWizard(cardId, collectionKey as CollectionType);
        break;
      }
    }
  }, [searchParams, selectCardForWizard]);

  useEffect(() => {
    if (selectedCardId) {
      setAnimate(true);
      setAnimated(true);
    }
  }, [selectedCardId]);

  return (
    <div className={cn('flex flex-col gap-5 font-libertinus text-stone-700 lg:gap-9', className)}>
      <motion.div
        {...fadeInProps}
        transition={{ duration: 0.35, delay: 1.5 }}
        className="flex items-center justify-between"
      >
        <nav className={cn('relative')} aria-label="Breadcrumb">
          <ul className="text-s group/nav flex items-center tracking-tight text-stone-600">
            <li>
              <Link
                href="/"
                className="focus-dashed flex items-baseline gap-1 px-1 hover:text-stone-800"
              >
                <span>anydaycard</span>
              </Link>
            </li>
            <li aria-hidden="true" className="text-stone-600 group-focus-within/nav:opacity-0">
              /
            </li>
            <li>
              <Link
                href="/card"
                aria-current="page"
                className="focus-dashed flex items-baseline gap-1 px-1 text-stone-600 hover:text-stone-800"
              >
                <span>card collection</span>
              </Link>
            </li>
          </ul>
        </nav>
        <CartButton />
      </motion.div>
      <h1>
        <AnimatedText
          text="Cards for any day"
          className="text-3xl tracking-tight lg:text-[2.5rem]"
        />{' '}
      </h1>
      <motion.div
        variants={{
          hidden: { opacity: 0 },
          show: {
            opacity: 1,
            transition: {
              when: 'beforeChildren',
              delay: 1.25,
              staggerChildren: 0.15,
            },
          },
        }}
        initial="hidden"
        animate="show"
        className="flex flex-col gap-5 lg:gap-5"
      >
        <motion.p variants={slideInVariants} className="text-pretty">
          Pick a card. Tell us about them. We&apos;ll write the message.
        </motion.p>

        <motion.p variants={slideInVariants} className="text-pretty">
          No more staring at a blank card wondering what to say. Answer a few questions about who
          it&apos;s for and how you feel — we&apos;ll help you find the right words.
        </motion.p>

        <AnimatePresence mode="popLayout" initial={false}>
          {selectedCardId && !wizardMode && (
            <motion.div
              key="personalize-cta"
              initial={{ opacity: 0, y: 8, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: 8, filter: 'blur(4px)' }}
              transition={{ duration: 0.35 }}
              className="rounded-2xl border border-stone-300 bg-white/95 p-4 text-stone-800 shadow-[0_12px_30px_rgba(0,0,0,0.18)] backdrop-blur-sm"
            >
              <p className="text-sm text-stone-700">
                Want it to feel personal? We&apos;ll guide you through a few quick prompts.
              </p>
              <Button
                onClick={() => startWizard()}
                variant="secondary"
                className="mt-3"
                buttonClassName="px-6"
              >
                Personalize this card
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          className="lg:hidden"
          variants={slideInVariants}
          onAnimationComplete={() => setAnimate(true)}
        >
          <EmptyState
            className="mx-auto mt-4 max-w-xl md:mt-10"
            animate={animate}
            shouldAnimate={!animated}
            onAnimationComplete={() => setAnimated(true)}
          />
        </motion.div>

        <motion.div
          className="mt-5 hidden lg:grid"
          variants={slideInVariants}
          onAnimationComplete={() => setAnimate(true)}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {selectedCardId ? (
              <motion.div key={wizardMode ? 'wizard' : 'metadata-table'} {...fadeInProps}>
                {wizardMode && card ? (
                  <CardWizard
                    card={card}
                    onBack={() => setWizardMode(false)}
                    onComplete={() => setWizardMode(false)}
                  />
                ) : (
                  <FocusLock disabled={wizardMode} group={`card-${selectedCardId}`}>
                    <MetadataTable />
                  </FocusLock>
                )}
              </motion.div>
            ) : (
              <motion.div key="empty-state" {...fadeInProps}>
                <EmptyState
                  className="mx-auto max-w-xl transform-gpu"
                  animate={animate}
                  shouldAnimate={!animated}
                  onAnimationComplete={() => setAnimated(true)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  );
}
