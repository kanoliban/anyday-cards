'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  Calendar,
  Heart,
  MessageSquare,
  Palette,
  Sparkles,
  User,
} from 'lucide-react';
import { useMemo } from 'react';

import { cn } from '~/src/util';

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
  icon: React.ReactNode;
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
        icon: <User className="size-3.5" />,
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
          icon: <Heart className="size-3.5" />,
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
          icon: <Calendar className="size-3.5" />,
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
          icon: <Palette className="size-3.5" />,
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
          icon: <Sparkles className="size-3.5" />,
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
          icon: <MessageSquare className="size-3.5" />,
        });
      }
    }

    // Quick traits (limit to 3)
    if (wizardAnswers.quickTraits && (wizardAnswers.quickTraits as string[]).length > 0) {
      const selectedTraits = (wizardAnswers.quickTraits as string[])
        .slice(0, 3)
        .map((t) => quickTraitOptions.find((o) => o.value === t))
        .filter(Boolean);

      if (selectedTraits.length > 0) {
        result.push({
          key: 'quickTraits',
          label: 'Traits',
          value: selectedTraits.map((t) => t!.label).join(', '),
          icon: <MessageSquare className="size-3.5" />,
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
        'border-t border-stone-200 bg-stone-50 px-4 py-3',
        className
      )}
    >
      <div className="flex items-center gap-6 overflow-x-auto">
        <div className="flex shrink-0 items-center gap-2">
          <Sparkles className="size-4 text-stone-400" />
          <span className="font-mono text-xs font-bold uppercase tracking-wide text-stone-400">
            Your Card Details
          </span>
        </div>

        <div className="flex items-center gap-4">
          <AnimatePresence mode="popLayout">
            {items.map((item) => (
              <motion.div
                key={item.key}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                layout
                className="flex shrink-0 items-center gap-1.5"
              >
                <span className="text-stone-400">{item.icon}</span>
                <span className="font-mono text-xs uppercase tracking-wide text-stone-400">
                  {item.label}:
                </span>
                <span className="text-sm font-medium text-stone-700">
                  {item.value}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
