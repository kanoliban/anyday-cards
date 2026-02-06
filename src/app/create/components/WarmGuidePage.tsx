'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { cn } from '~/src/util';

import { cards, collections, type CollectionType } from '../constants';
import type { Card } from '../models';
import { useCardStore } from '../store';
import CartDrawer from '../../(main)/shop/components/CartDrawer';
import SVGFilters from './SVGFilters';
import TypeformCardWizard from './TypeformCardWizard';

type Stage = 'welcome' | 'canvas' | 'templates' | 'generate' | 'writing';

function findCard(cardId: string | null): { card: Card; collectionKey: CollectionType } | null {
  if (!cardId) return null;
  for (const [collectionKey, collectionData] of Object.entries(collections)) {
    const found = collectionData.cards.find((c) => c.id === cardId);
    if (found) return { card: found as Card, collectionKey: collectionKey as CollectionType };
  }
  return null;
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="rounded-md border border-stone-200 bg-white px-2 py-1 font-mono text-xs text-stone-700 shadow-sm">
      {children}
    </kbd>
  );
}

function WizardShell({
  children,
  right,
}: {
  children: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex h-dvh w-full max-w-6xl flex-col overflow-hidden px-6">
      <header className="flex shrink-0 items-center justify-between pt-6 sm:pt-8">
        <Link
          href="/"
          className="flex items-center gap-2 font-archivo text-lg font-bold text-stone-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-200"
        >
          <span className="size-2 rounded-full bg-rose-600" aria-hidden />
          AnydayCard
        </Link>
        {right}
      </header>
      <main className="flex flex-1 items-center overflow-hidden py-8 sm:py-10">
        <div className="w-full">{children}</div>
      </main>
    </div>
  );
}

function BigChoice({
  title,
  subtitle,
  badge,
  onClick,
}: {
  title: string;
  subtitle: string;
  badge?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-start justify-between gap-4 rounded-2xl border border-stone-200 bg-white p-4 text-left shadow-sm transition-colors hover:border-stone-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-200 sm:p-5"
    >
      <div className="min-w-0">
        <p className="text-base font-semibold text-stone-900 sm:text-lg">{title}</p>
        <p className="mt-1 text-pretty text-sm text-stone-600">{subtitle}</p>
      </div>
      {badge && (
        <span className="shrink-0 rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs font-semibold text-stone-700">
          {badge}
        </span>
      )}
    </button>
  );
}

export default function WarmGuidePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const cardIdFromUrl = searchParams.get('card');

  const selectCardForWizard = useCardStore((s) => s.selectCardForWizard);
  const resetWizard = useCardStore((s) => s.resetWizard);

  const resolved = useMemo(() => findCard(cardIdFromUrl), [cardIdFromUrl]);
  const cardFromUrl = resolved?.card ?? null;

  // Lock page scroll for the full-screen wizard route (all stages).
  useEffect(() => {
    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    return () => {
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.overflow = prevBodyOverflow;
    };
  }, []);

  useEffect(() => {
    if (!resolved) return;
    selectCardForWizard(resolved.card.id, resolved.collectionKey);
  }, [resolved, selectCardForWizard]);

  const [stage, setStage] = useState<Stage>('welcome');
  const returnStageRef = useRef<Stage>('welcome');
  const [writingCardOverride, setWritingCardOverride] = useState<Card | null>(null);

  const activeCard = writingCardOverride ?? cardFromUrl;

  const isInvalidCardParam = Boolean(cardIdFromUrl) && !cardFromUrl;

  // Template paging (no scrolling): fewer cards per page on small screens.
  const [pageSize, setPageSize] = useState(6);
  const [pageIndex, setPageIndex] = useState(0);

  useEffect(() => {
    const mql = window.matchMedia('(min-width: 640px)');
    const apply = () => setPageSize(mql.matches ? 6 : 4);
    apply();
    mql.addEventListener('change', apply);
    return () => mql.removeEventListener('change', apply);
  }, []);

  const pageCount = Math.max(1, Math.ceil(cards.length / pageSize));
  useEffect(() => {
    setPageIndex((prev) => Math.min(prev, pageCount - 1));
  }, [pageCount]);

  const pagedCards = useMemo(() => {
    const start = pageIndex * pageSize;
    return cards.slice(start, start + pageSize);
  }, [pageIndex, pageSize]);

  const beginWriting = (from: Stage, card: Card) => {
    returnStageRef.current = from;
    setWritingCardOverride(card);
    resetWizard();
    setStage('writing');
    router.replace(`/create/wizard?card=${encodeURIComponent(card.id)}`);
  };

  useEffect(() => {
    if (stage !== 'writing') return;
    if (activeCard) return;
    setStage('templates');
  }, [activeCard, stage]);

  useEffect(() => {
    if (stage !== 'welcome') return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Enter') return;
      event.preventDefault();
      if (cardFromUrl) {
        beginWriting('welcome', cardFromUrl);
      } else {
        setStage('canvas');
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [cardFromUrl, stage]);

  return (
    <div className="grain grain-strong relative h-dvh overflow-hidden overscroll-none bg-stone-100">
      <SVGFilters className="pointer-events-none absolute" />

      {isInvalidCardParam ? (
        <WizardShell>
          <div className="max-w-md">
            <p className="text-pretty text-sm text-stone-600">That card link doesn&apos;t look right.</p>
            <button
              type="button"
              onClick={() => {
                setStage('welcome');
                setWritingCardOverride(null);
                router.replace('/create/wizard');
              }}
              className="mt-4 rounded-xl border border-stone-200 bg-white px-5 py-2.5 text-sm font-semibold text-stone-900 shadow-sm transition-colors hover:border-stone-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-200"
            >
              Back to Card Wizard
            </button>
          </div>
        </WizardShell>
      ) : stage === 'writing' && activeCard ? (
        <TypeformCardWizard
          card={activeCard}
          disableIntro
          onExit={() => {
            const next = returnStageRef.current;
            setWritingCardOverride(null);
            router.replace('/create/wizard');
            setStage(next);
          }}
        />
      ) : stage === 'welcome' ? (
        <div className="mx-auto flex h-dvh w-full max-w-3xl flex-col overflow-hidden px-6 text-center">
          <div className="flex flex-1 flex-col items-center justify-center">
            <div className="flex size-14 items-center justify-center rounded-full border border-stone-200 bg-white shadow-sm">
              <Sparkles className="size-6 text-stone-900" aria-hidden />
            </div>
            <h1 className="mt-6 font-libertinus text-4xl font-semibold leading-tight text-balance text-stone-900 sm:text-5xl">
              Let&apos;s write the card together.
            </h1>
            <p className="mt-4 max-w-xl text-pretty text-base text-stone-600 sm:text-lg">
              A few quick prompts, then a draft that sounds like you. Press <Kbd>Enter</Kbd> anytime
              to keep moving.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  if (cardFromUrl) {
                    beginWriting('welcome', cardFromUrl);
                    return;
                  }
                  setStage('canvas');
                }}
                className="rounded-xl bg-stone-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-stone-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-200"
              >
                Start
              </button>
              <button
                type="button"
                onClick={() => {
                  if (cardFromUrl) {
                    beginWriting('welcome', cardFromUrl);
                    return;
                  }
                  setStage('templates');
                }}
                className="rounded-xl border border-stone-200 bg-white px-6 py-3 text-sm font-semibold text-stone-900 shadow-sm transition-colors hover:border-stone-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-200"
              >
                Jump in
              </button>
            </div>
          </div>

          <div className="pb-[calc(env(safe-area-inset-bottom)+1.5rem)] pt-6">
            <p className="text-pretty text-xs text-stone-500">
              Want to browse first?{' '}
              <Link
                href="/card"
                className="font-semibold text-stone-700 underline decoration-stone-300 underline-offset-4 hover:text-stone-900"
              >
                Card Gallery
              </Link>
            </p>
          </div>
        </div>
      ) : stage === 'canvas' ? (
        <WizardShell
          right={
            <Link
              href="/create/wizard-classic"
              className="rounded-full border border-stone-200 bg-white px-4 py-2 text-xs font-semibold text-stone-900 shadow-sm transition-colors hover:border-stone-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-200"
            >
              Classic
            </Link>
          }
        >
          <div className="max-w-3xl">
            <p className="font-archivo text-xs font-semibold uppercase text-rose-700">Card Wizard</p>
            <h1 className="mt-4 font-libertinus text-3xl font-semibold leading-tight text-balance text-stone-900 sm:text-5xl">
              Choose your starting point.
            </h1>
            <p className="mt-4 max-w-2xl text-pretty text-base text-stone-600 sm:text-lg">
              Pick a template, or generate a brand new card design.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <BigChoice
                title="Choose a pre-made card"
                subtitle="Start from a beautiful design, then we’ll write the message together."
                onClick={() => setStage('templates')}
              />
              <BigChoice
                title="Generate a new card"
                subtitle="Describe the vibe and we’ll design the card from scratch."
                badge="Coming soon"
                onClick={() => setStage('generate')}
              />
            </div>

            <div className="mt-10 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setStage('welcome')}
                className="rounded-xl border border-stone-200 bg-white px-5 py-2.5 text-sm font-semibold text-stone-900 shadow-sm transition-colors hover:border-stone-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-200"
              >
                Back
              </button>
              <Link
                href="/create"
                className="rounded-xl bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-stone-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-200"
              >
                Open card canvas
              </Link>
            </div>
          </div>
        </WizardShell>
      ) : stage === 'generate' ? (
        <WizardShell>
          <div className="max-w-2xl">
            <p className="font-archivo text-xs font-semibold uppercase text-rose-700">Card Wizard</p>
            <h1 className="mt-4 font-libertinus text-3xl font-semibold leading-tight text-balance text-stone-900 sm:text-5xl">
              Generate a new card
            </h1>
            <p className="mt-4 max-w-xl text-pretty text-base text-stone-600 sm:text-lg">
              This is coming soon. For now, choose a template and we&apos;ll make the message feel
              personal.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setStage('templates')}
                className="rounded-xl bg-stone-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-stone-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-200"
              >
                Choose a template
              </button>
              <button
                type="button"
                onClick={() => setStage('canvas')}
                className="rounded-xl border border-stone-200 bg-white px-6 py-3 text-sm font-semibold text-stone-900 shadow-sm transition-colors hover:border-stone-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-200"
              >
                Back
              </button>
            </div>
          </div>
        </WizardShell>
      ) : (
        <WizardShell
          right={
            <div className="text-sm text-stone-500 tabular-nums">
              Page {pageIndex + 1} of {pageCount}
            </div>
          }
        >
          <div className="mx-auto w-full max-w-5xl">
            <div className="max-w-3xl">
              <p className="font-archivo text-xs font-semibold uppercase text-rose-700">Card Wizard</p>
              <h1 className="mt-4 font-libertinus text-3xl font-semibold leading-tight text-balance text-stone-900 sm:text-5xl">
                Choose a card template.
              </h1>
              <p className="mt-4 max-w-2xl text-pretty text-base text-stone-600 sm:text-lg">
                Pick a design, then we&apos;ll write something that sounds like you.
              </p>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-2 sm:mt-8 sm:gap-3 sm:grid-cols-3">
              {pagedCards.map((card) => (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => beginWriting('templates', card)}
                  className="group rounded-2xl border border-stone-200 bg-white p-2 text-left shadow-sm transition-colors hover:border-stone-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-200 sm:p-3"
                >
                  <div className="relative h-36 w-full overflow-hidden rounded-xl bg-stone-50 sm:h-40 md:h-44">
                    <Image
                      src={card.src}
                      alt={card.name}
                      fill
                      sizes="(min-width: 1024px) 220px, (min-width: 640px) 200px, 45vw"
                      className="object-contain"
                    />
                  </div>
                  <div className="mt-2">
                    <p className="truncate text-xs font-semibold text-stone-900 sm:text-sm">{card.name}</p>
                    <p className="truncate text-[11px] text-stone-600 sm:text-xs">{card.occasion}</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 sm:mt-8">
              <button
                type="button"
                onClick={() => setStage('canvas')}
                className="rounded-xl border border-stone-200 bg-white px-5 py-2.5 text-sm font-semibold text-stone-900 shadow-sm transition-colors hover:border-stone-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-200"
              >
                Back
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
                  disabled={pageIndex === 0}
                  className={cn(
                    'rounded-xl border px-4 py-2.5 text-sm font-semibold shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-200',
                    pageIndex === 0
                      ? 'cursor-not-allowed border-stone-200 bg-stone-100 text-stone-400'
                      : 'border-stone-200 bg-white text-stone-900 hover:border-stone-400',
                  )}
                >
                  Prev
                </button>
                <button
                  type="button"
                  onClick={() => setPageIndex((p) => Math.min(pageCount - 1, p + 1))}
                  disabled={pageIndex >= pageCount - 1}
                  className={cn(
                    'rounded-xl border px-4 py-2.5 text-sm font-semibold shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-200',
                    pageIndex >= pageCount - 1
                      ? 'cursor-not-allowed border-stone-200 bg-stone-100 text-stone-400'
                      : 'border-stone-200 bg-white text-stone-900 hover:border-stone-400',
                  )}
                >
                  Next
                </button>
              </div>

              <Link
                href="/card"
                className="rounded-xl bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-stone-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-200"
              >
                Browse full gallery
              </Link>
            </div>
          </div>
        </WizardShell>
      )}

      {/* Needed so "Add to cart" can immediately show the drawer on this route. */}
      <CartDrawer />
    </div>
  );
}
