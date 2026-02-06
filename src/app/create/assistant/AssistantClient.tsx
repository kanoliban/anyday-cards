'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import Button from '~/src/components/ui/Button';

import { cards, collections, type CollectionType } from '../constants';
import type { Card } from '../models';
import { useCardStore } from '../store';
import SVGFilters from '../components/SVGFilters';
import WizardOverlay from '../components/WizardOverlay';

const featuredCards = cards.slice(0, 6);

export default function AssistantClient() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const cardId = searchParams.get('card');

  const selectedCardId = useCardStore((s) => s.selectedCardId);
  const wizardMode = useCardStore((s) => s.wizardMode);
  const selectCardForWizard = useCardStore((s) => s.selectCardForWizard);

  useEffect(() => {
    if (!cardId) return;
    for (const [collectionKey, collectionData] of Object.entries(collections)) {
      const found = collectionData.cards.find((c) => c.id === cardId);
      if (found) {
        selectCardForWizard(cardId, collectionKey as CollectionType);
        break;
      }
    }
  }, [cardId, selectCardForWizard]);

  const selectedCard: Card | null = useMemo(() => {
    if (!selectedCardId) return null;
    for (const collection of Object.values(collections)) {
      const found = collection.cards.find((c) => c.id === selectedCardId);
      if (found) return found;
    }
    return null;
  }, [selectedCardId]);

  const showPicker = !selectedCardId || !wizardMode;

  return (
    <div className="grain grain-strong relative min-h-dvh bg-stone-100">
      <SVGFilters className="pointer-events-none absolute" />

      {showPicker && (
        <main className="mx-auto flex min-h-dvh max-w-5xl flex-col items-center justify-center gap-8 px-6 py-16 text-center">
          <div className="space-y-3">
            <h1 className="text-3xl font-semibold text-stone-900 sm:text-4xl">
              Let&apos;s write your card
            </h1>
            <p className="text-base text-stone-700 sm:text-lg">
              Pick a card to start. We&apos;ll guide the message so it sounds like you.
            </p>
          </div>

          <div className="grid w-full grid-cols-2 gap-4 sm:grid-cols-3">
            {featuredCards.map((card) => (
              <button
                key={card.id}
                type="button"
                onClick={() => {
                  selectCardForWizard(card.id, card.collection as CollectionType);
                  router.replace(`${pathname}?card=${card.id}`);
                }}
                className="group rounded-xl border border-stone-300 bg-white p-3 text-left shadow-[0_8px_20px_rgba(0,0,0,0.08)] transition-all hover:-translate-y-0.5 hover:border-stone-500"
              >
                <div className="relative aspect-[4/5] w-full overflow-hidden rounded-lg bg-stone-100">
                  <Image src={card.src} alt={card.name} fill className="object-contain" />
                </div>
                <div className="mt-3">
                  <p className="text-sm font-semibold text-stone-900">{card.name}</p>
                  <p className="text-xs text-stone-600">{card.occasion}</p>
                </div>
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button asChild variant="secondary">
              <Link href="/create">Open Card Canvas</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/create/wizard">Card Wizard</Link>
            </Button>
            <Button asChild variant="text" className="text-stone-700 hover:text-stone-900">
              <Link href="/card">Browse the full gallery</Link>
            </Button>
          </div>
        </main>
      )}

      {selectedCard && <WizardOverlay />}
    </div>
  );
}

