'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useMemo } from 'react';

import { cn } from '~/src/util';

import type { WizardAnswers } from '../models';
import { useCardStore } from '../store';
import {
  heartfeltDepthOptions,
  humorTypeOptions,
  occasionOptions,
  quickTraitOptions,
  relationshipOptions,
  vibeOptions,
} from './questions';

type Props = {
  className?: string;
};

type AnswerItem = {
  key: string;
  label: string;
  value: string;
  emoji?: string;
};

export default function AnswerSummary({ className }: Props) {
  const wizardAnswers = useCardStore((s) => s.wizardAnswers);
  const wizardMode = useCardStore((s) => s.wizardMode);

  const items = useMemo<AnswerItem[]>(() => {
    const result: AnswerItem[] = [];

    // Name
    if (wizardAnswers.name) {
      result.push({
        key: 'name',
        label: 'For',
        value: wizardAnswers.name,
      });
    }

    // Relationship
    if (wizardAnswers.relationshipType) {
      const option = relationshipOptions.find(
        (o) => o.value === wizardAnswers.relationshipType
      );
      if (option) {
        result.push({
          key: 'relationship',
          label: 'Relationship',
          value: option.label,
          emoji: option.emoji,
        });
      }
    }

    // Occasion
    if (wizardAnswers.occasion) {
      const option = occasionOptions.find((o) => o.value === wizardAnswers.occasion);
      if (option) {
        result.push({
          key: 'occasion',
          label: 'Occasion',
          value: option.label,
          emoji: option.emoji,
        });
      }
    }

    // Vibes
    if (wizardAnswers.vibes && wizardAnswers.vibes.length > 0) {
      const selectedVibes = (wizardAnswers.vibes as string[])
        .map((v) => vibeOptions.find((o) => o.value === v))
        .filter(Boolean);

      if (selectedVibes.length > 0) {
        result.push({
          key: 'vibes',
          label: 'Vibe',
          value: selectedVibes.map((v) => v!.label).join(' + '),
          emoji: selectedVibes[0]?.emoji,
        });
      }
    }

    // Humor type
    if (wizardAnswers.humorType) {
      const option = humorTypeOptions.find(
        (o) => o.value === wizardAnswers.humorType
      );
      if (option) {
        result.push({
          key: 'humorType',
          label: 'Humor',
          value: option.label,
        });
      }
    }

    // Heartfelt depth
    if (wizardAnswers.heartfeltDepth) {
      const option = heartfeltDepthOptions.find(
        (o) => o.value === wizardAnswers.heartfeltDepth
      );
      if (option) {
        result.push({
          key: 'heartfeltDepth',
          label: 'Depth',
          value: option.label,
        });
      }
    }

    // Quick traits
    if (wizardAnswers.quickTraits && (wizardAnswers.quickTraits as string[]).length > 0) {
      const selectedTraits = (wizardAnswers.quickTraits as string[])
        .map((t) => quickTraitOptions.find((o) => o.value === t))
        .filter(Boolean);

      if (selectedTraits.length > 0) {
        result.push({
          key: 'quickTraits',
          label: 'Traits',
          value: selectedTraits.map((t) => t!.label).join(', '),
        });
      }
    }

    return result;
  }, [wizardAnswers]);

  if (!wizardMode || items.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'rounded-xl border border-stone-200 bg-white/80 p-4 backdrop-blur-sm',
        className
      )}
    >
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-stone-500">
        Building your card
      </h3>
      <div className="flex flex-wrap gap-2">
        <AnimatePresence mode="popLayout">
          {items.map((item) => (
            <motion.div
              key={item.key}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              layout
              className="flex items-center gap-1.5 rounded-full bg-stone-100 px-3 py-1.5"
            >
              {item.emoji && (
                <span className="text-sm" role="img" aria-hidden>
                  {item.emoji}
                </span>
              )}
              <span className="text-xs text-stone-500">{item.label}:</span>
              <span className="text-xs font-medium text-stone-700">{item.value}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
