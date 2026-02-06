'use client';

import { useEffect, useMemo } from 'react';

import { collections } from '../constants';
import type { Card } from '../models';
import { useCardStore } from '../store';
import CardWizard from './CardWizard';

export default function WizardOverlay() {
  const selectedCardId = useCardStore((s) => s.selectedCardId);
  const collection = useCardStore((s) => s.collection);
  const wizardMode = useCardStore((s) => s.wizardMode);
  const setWizardMode = useCardStore((s) => s.setWizardMode);

  const card = useMemo(() => {
    if (!selectedCardId) return null;
    return (collections[collection]?.cards.find((c) => c.id === selectedCardId) as Card) ?? null;
  }, [collection, selectedCardId]);

  useEffect(() => {
    if (!wizardMode) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [wizardMode]);

  if (!wizardMode || !card) return null;

  return (
    <div className="grain grain-strong fixed inset-0 z-50 flex min-h-dvh flex-col bg-stone-100">
      <main className="flex flex-1 items-center justify-center px-4 pb-24 pt-10 sm:px-6">
        <div className="w-full max-w-3xl">
          <CardWizard
            card={card}
            onComplete={() => setWizardMode(false)}
            onBack={() => setWizardMode(false)}
            size="fullscreen"
          />
        </div>
      </main>
    </div>
  );
}
