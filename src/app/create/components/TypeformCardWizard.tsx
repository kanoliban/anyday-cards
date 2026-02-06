'use client';

import Link from 'next/link';
import { ArrowLeft, ArrowRight, Check, Sparkles, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { getEffectiveEndpoint } from '~/src/lib/ab-testing';
import { trackMessageGenerated, trackMessageRegenerated } from '~/src/lib/analytics';
import { cn } from '~/src/util';

import { useCartStore } from '../../(main)/shop/store';
import type { Card, CardVariant, RelationshipType, WizardAnswers, WizardStep } from '../models';
import { useCardStore } from '../store';
import {
  HEARTFELT_OPTIONS,
  HUMOR_OPTIONS,
  OCCASION_OPTIONS,
  QUICK_TRAIT_OPTIONS,
  RELATIONSHIP_OPTIONS,
  RELATIONSHIP_QUESTIONS,
  VIBE_OPTIONS,
} from './cardWizardConfig';

type Props = {
  card: Card;
  onExit?: () => void;
  disableIntro?: boolean;
};

function pad2(n: number) {
  return String(n).padStart(2, '0');
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="rounded-md border border-stone-200 bg-white px-2 py-1 font-mono text-xs text-stone-700 shadow-sm">
      {children}
    </kbd>
  );
}

function ChoiceTile({
  selected,
  title,
  subtitle,
  emoji,
  onSelect,
  name,
  value,
}: {
  selected: boolean;
  title: string;
  subtitle?: string;
  emoji?: string;
  onSelect: () => void;
  name: string;
  value: string;
}) {
  const id = `${name}-${value}`;
  return (
    <label
      htmlFor={id}
      className={cn(
        'group relative flex cursor-pointer items-start justify-between gap-4 rounded-2xl border bg-white p-4 text-left shadow-sm transition-colors focus-within:ring-2 focus-within:ring-rose-200',
        selected
          ? 'border-rose-600 ring-1 ring-rose-600'
          : 'border-stone-200 hover:border-stone-400',
      )}
    >
      <input
        id={id}
        name={name}
        type="radio"
        value={value}
        checked={selected}
        onChange={onSelect}
        className="sr-only"
      />
      <div className="flex items-start gap-3">
        {emoji && <span className="text-2xl" aria-hidden>{emoji}</span>}
        <div className="min-w-0">
          <p className="text-base font-semibold text-stone-900">{title}</p>
          {subtitle && <p className="mt-1 text-pretty text-sm text-stone-600">{subtitle}</p>}
        </div>
      </div>
      <div className="shrink-0">
        <span
          className={cn(
            'grid size-8 place-items-center rounded-full border transition-colors',
            selected ? 'border-rose-600 bg-rose-600 text-white' : 'border-stone-200 bg-white text-stone-400',
          )}
          aria-hidden
        >
          <Check className="size-4" />
        </span>
      </div>
    </label>
  );
}

function PillToggle({
  checked,
  label,
  emoji,
  onChange,
  name,
  value,
}: {
  checked: boolean;
  label: string;
  emoji?: string;
  onChange: () => void;
  name: string;
  value: string;
}) {
  const id = `${name}-${value}`;
  return (
    <label
      htmlFor={id}
      className={cn(
        'inline-flex cursor-pointer items-center gap-2 rounded-full border bg-white px-4 py-2 text-sm font-medium shadow-sm transition-colors focus-within:ring-2 focus-within:ring-rose-200',
        checked ? 'border-rose-600 bg-rose-50 text-stone-900' : 'border-stone-200 text-stone-800 hover:border-stone-400',
      )}
    >
      <input
        id={id}
        name={name}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="sr-only"
      />
      {emoji && <span className="text-base" aria-hidden>{emoji}</span>}
      <span className="whitespace-nowrap">{label}</span>
    </label>
  );
}

function ListTile({
  selected,
  title,
  description,
  onSelect,
  name,
  value,
}: {
  selected: boolean;
  title: string;
  description?: string;
  onSelect: () => void;
  name: string;
  value: string;
}) {
  const id = `${name}-${value}`;
  return (
    <label
      htmlFor={id}
      className={cn(
        'group relative flex cursor-pointer items-start justify-between gap-4 rounded-2xl border bg-white p-5 text-left shadow-sm transition-colors focus-within:ring-2 focus-within:ring-rose-200',
        selected
          ? 'border-rose-600 ring-1 ring-rose-600'
          : 'border-stone-200 hover:border-stone-400',
      )}
    >
      <input
        id={id}
        name={name}
        type="radio"
        value={value}
        checked={selected}
        onChange={onSelect}
        className="sr-only"
      />
      <div className="min-w-0">
        <p className="text-base font-semibold text-stone-900 sm:text-lg">{title}</p>
        {description && <p className="mt-1 text-pretty text-sm text-stone-600">{description}</p>}
      </div>
      <div className="shrink-0">
        <span
          className={cn(
            'grid size-8 place-items-center rounded-full border transition-colors',
            selected ? 'border-rose-600 bg-rose-600 text-white' : 'border-stone-200 bg-white text-stone-400',
          )}
          aria-hidden
        >
          <Check className="size-4" />
        </span>
      </div>
    </label>
  );
}

export default function TypeformCardWizard({ card, onExit, disableIntro }: Props) {
  const wizardStep = useCardStore((s) => s.wizardStep);
  const wizardAnswers = useCardStore((s) => s.wizardAnswers);
  const setWizardStep = useCardStore((s) => s.setWizardStep);
  const setWizardAnswer = useCardStore((s) => s.setWizardAnswer);
  const resetWizard = useCardStore((s) => s.resetWizard);

  const [variant, setVariant] = useState<CardVariant>('digital');
  const [generatedMessage, setGeneratedMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const regenerationCountRef = useRef(0);
  const [added, setAdded] = useState(false);
  const [introDismissed, setIntroDismissed] = useState(false);
  const [done, setDone] = useState(false);

  const addItem = useCartStore((s) => s.addItem);
  const setCartOpen = useCartStore((s) => s.setOpen);

  // Lock page scroll while the full-screen guide is open.
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

  const visibleSteps = useMemo((): WizardStep[] => {
    const vibes = wizardAnswers.vibes || [];
    const hasFunny = vibes.includes('funny');
    const hasHeartfelt = vibes.includes('heartfelt') || vibes.includes('grateful') || vibes.includes('nostalgic');

    const steps: WizardStep[] = ['name', 'relationship', 'occasion', 'vibe'];
    if (hasFunny) steps.push('humorType');
    if (hasHeartfelt) steps.push('heartfeltDepth');
    steps.push('relationshipQuestions', 'quickTraits', 'preview');
    return steps;
  }, [wizardAnswers.vibes]);

  const visibleStepIndex = visibleSteps.indexOf(wizardStep);
  const totalSteps = visibleSteps.length;
  const stepNumber = Math.max(1, visibleStepIndex + 1);

  const canProceed = useMemo(() => {
    switch (wizardStep) {
      case 'name':
        return Boolean((wizardAnswers.name || '').trim());
      case 'relationship':
        return Boolean(wizardAnswers.relationshipType);
      case 'occasion':
        return Boolean(wizardAnswers.occasion);
      case 'vibe':
        return (wizardAnswers.vibes?.length || 0) > 0;
      case 'humorType':
        return Boolean(wizardAnswers.humorType);
      case 'heartfeltDepth':
        return Boolean(wizardAnswers.heartfeltDepth);
      case 'relationshipQuestions': {
        const relType = wizardAnswers.relationshipType as RelationshipType;
        const questions = RELATIONSHIP_QUESTIONS[relType] || [];
        if (questions.length === 0) return true;
        return Boolean(wizardAnswers[questions[0].key]);
      }
      case 'quickTraits':
        return true;
      case 'preview':
        return true;
      default:
        return true;
    }
  }, [wizardStep, wizardAnswers]);

  const goToStep = useCallback(
    (step: WizardStep) => {
      setWizardStep(step);
    },
    [setWizardStep],
  );

  const goNext = useCallback(() => {
    const nextIndex = Math.min(visibleSteps.length - 1, Math.max(0, visibleStepIndex) + 1);
    const next = visibleSteps[nextIndex];
    if (next) goToStep(next);
  }, [visibleStepIndex, visibleSteps, goToStep]);

  const goBack = useCallback(() => {
    if (visibleStepIndex <= 0) {
      resetWizard();
      onExit?.();
      return;
    }
    const prevIndex = visibleStepIndex - 1;
    const prev = visibleSteps[prevIndex];
    if (prev) goToStep(prev);
  }, [visibleStepIndex, visibleSteps, goToStep, onExit, resetWizard]);

  const handleGenerateMessage = useCallback(async () => {
    setIsGenerating(true);
    setGenerationError(null);
    const isRegenerate = regenerationCountRef.current > 0;

    try {
      const endpoint = getEffectiveEndpoint();
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientName: wizardAnswers.name,
          relationship: wizardAnswers.relationshipType,
          occasion: wizardAnswers.occasion,
          vibes: wizardAnswers.vibes,
          humorType: wizardAnswers.humorType,
          heartfeltDepth: wizardAnswers.heartfeltDepth,
          quickTraits: wizardAnswers.quickTraits,
          relationshipDetails: Object.fromEntries(
            Object.entries(wizardAnswers).filter(
              ([key]) =>
                !['name', 'relationshipType', 'occasion', 'vibes', 'humorType', 'heartfeltDepth', 'quickTraits'].includes(key),
            ),
          ),
          cardName: card.name,
          cardTone: card.tone,
        }),
      });

      if (!response.ok) {
        setGenerationError('Could not generate a message. Please try again.');
        return;
      }

      const data = await response.json();
      setGeneratedMessage(data.message);

      const trackingMetadata = {
        occasion: wizardAnswers.occasion,
        relationship: wizardAnswers.relationshipType,
        vibes: wizardAnswers.vibes,
        isFallback: data.isFallback,
      };

      if (isRegenerate) {
        regenerationCountRef.current += 1;
        trackMessageRegenerated(data.version, regenerationCountRef.current, trackingMetadata);
      } else {
        regenerationCountRef.current = 1;
        trackMessageGenerated(data.version, trackingMetadata);
      }
    } catch (error) {
      console.error('[WarmGuide] Generate message error:', error);
      setGenerationError('Could not generate a message. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  }, [card.name, card.tone, wizardAnswers]);

  const handleAddToCart = useCallback(() => {
    if (done) return;
    addItem(card, variant, 1, {
      recipientName: wizardAnswers.name || '',
      relationship: wizardAnswers.relationshipType || '',
      occasion: wizardAnswers.occasion || card.occasion,
      message: generatedMessage,
      wizardAnswers: wizardAnswers as WizardAnswers,
      generatedAt: new Date().toISOString(),
    });
    setAdded(true);
    setCartOpen(true);
    setDone(true);
  }, [addItem, card, done, generatedMessage, setCartOpen, variant, wizardAnswers]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Enter') return;
      const target = event.target as HTMLElement | null;
      if (target?.tagName === 'TEXTAREA') return;

      event.preventDefault();
      if (done) {
        setCartOpen(true);
        return;
      }
      if (wizardStep === 'preview') {
        if (generatedMessage) {
          handleAddToCart();
        } else {
          handleGenerateMessage();
        }
        return;
      } else {
        if (!canProceed) return;
        goNext();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [canProceed, done, generatedMessage, goNext, handleAddToCart, handleGenerateMessage, setCartOpen, wizardStep]);

  const hasAnyAnswers = useMemo(() => {
    return Object.values(wizardAnswers).some((value) => {
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === 'string') return value.trim().length > 0;
      return Boolean(value);
    });
  }, [wizardAnswers]);

  const showIntro = !disableIntro && wizardStep === 'name' && !introDismissed && !hasAnyAnswers;

  const stepCopy = useMemo(() => {
    const name = (wizardAnswers.name || '').trim() || 'them';
    switch (wizardStep) {
      case 'name':
        return {
          title: "Who’s this card for?",
          subtitle: 'Just a first name is perfect.',
        };
      case 'relationship':
        return {
          title: `Who are they to you?`,
          subtitle: `This helps the message sound like you and ${name}.`,
        };
      case 'occasion':
        return {
          title: `What’s the occasion?`,
          subtitle: 'We’ll match the message to the moment.',
        };
      case 'vibe':
        return {
          title: `What feeling are you going for?`,
          subtitle: 'Pick one or a few.',
        };
      case 'humorType':
        return {
          title: `How should the humor land?`,
          subtitle: 'We’ll keep it true to your relationship.',
        };
      case 'heartfeltDepth':
        return {
          title: `How deep should we go?`,
          subtitle: 'Light and warm, or full heart. You decide.',
        };
      case 'relationshipQuestions':
        return {
          title: `One real detail helps a lot.`,
          subtitle: `A tiny true moment beats generic words every time.`,
        };
      case 'quickTraits':
        return {
          title: `Any quick traits about ${name}?`,
          subtitle: 'Optional, but it makes the message feel unmistakably yours.',
        };
      case 'preview':
        return {
          title: `Here’s a first draft.`,
          subtitle: 'Generate one, tweak it, regenerate. This is just the start.',
        };
      default:
        return null;
    }
  }, [wizardAnswers.name, wizardStep]);

  const renderStep = () => {
    switch (wizardStep) {
      case 'name':
        return (
          <div className="max-w-xl">
            <label className="sr-only" htmlFor="recipient-name">
              Recipient name
            </label>
            <input
              id="recipient-name"
              type="text"
              value={wizardAnswers.name || ''}
              onChange={(e) => setWizardAnswer('name', e.target.value)}
              placeholder="Their name"
              autoFocus
              className={cn(
                'w-full border-b border-stone-300 bg-transparent pb-3 font-libertinus text-3xl text-stone-900 placeholder:text-stone-400 focus:border-stone-900 focus:outline-none sm:text-4xl',
              )}
            />
          </div>
        );

      case 'relationship':
        return (
          <fieldset className="w-full">
            <legend className="sr-only">Relationship</legend>
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {RELATIONSHIP_OPTIONS.map((opt) => (
                <ChoiceTile
                  key={opt.value}
                  name="relationshipType"
                  value={opt.value}
                  selected={wizardAnswers.relationshipType === opt.value}
                  title={opt.label}
                  emoji={opt.emoji}
                  onSelect={() => setWizardAnswer('relationshipType', opt.value)}
                />
              ))}
            </div>
          </fieldset>
        );

      case 'occasion':
        return (
          <fieldset className="w-full">
            <legend className="sr-only">Occasion</legend>
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {OCCASION_OPTIONS.map((opt) => (
                <ChoiceTile
                  key={opt.value}
                  name="occasion"
                  value={opt.value}
                  selected={wizardAnswers.occasion === opt.value}
                  title={opt.label}
                  emoji={opt.emoji}
                  onSelect={() => setWizardAnswer('occasion', opt.value)}
                />
              ))}
            </div>
          </fieldset>
        );

      case 'vibe': {
        const current = wizardAnswers.vibes || [];
        return (
          <fieldset className="w-full">
            <legend className="sr-only">Vibe</legend>
            <div className="flex flex-wrap gap-3">
              {VIBE_OPTIONS.map((opt) => {
                const checked = current.includes(opt.value);
                return (
                  <PillToggle
                    key={opt.value}
                    name="vibes"
                    value={opt.value}
                    checked={checked}
                    label={opt.label}
                    emoji={opt.emoji}
                    onChange={() => {
                      if (checked) {
                        setWizardAnswer(
                          'vibes',
                          current.filter((v) => v !== opt.value),
                        );
                      } else {
                        setWizardAnswer('vibes', [...current, opt.value]);
                      }
                    }}
                  />
                );
              })}
            </div>
          </fieldset>
        );
      }

      case 'humorType':
        return (
          <fieldset className="w-full">
            <legend className="sr-only">Humor style</legend>
            <div className="grid gap-4">
              {HUMOR_OPTIONS.map((opt) => (
                <ListTile
                  key={opt.value}
                  name="humorType"
                  value={opt.value}
                  selected={wizardAnswers.humorType === opt.value}
                  title={opt.label}
                  description={opt.description}
                  onSelect={() => setWizardAnswer('humorType', opt.value)}
                />
              ))}
            </div>
          </fieldset>
        );

      case 'heartfeltDepth':
        return (
          <fieldset className="w-full">
            <legend className="sr-only">Heartfelt depth</legend>
            <div className="grid gap-4">
              {HEARTFELT_OPTIONS.map((opt) => (
                <ListTile
                  key={opt.value}
                  name="heartfeltDepth"
                  value={opt.value}
                  selected={wizardAnswers.heartfeltDepth === opt.value}
                  title={opt.label}
                  description={opt.description}
                  onSelect={() => setWizardAnswer('heartfeltDepth', opt.value)}
                />
              ))}
            </div>
          </fieldset>
        );

      case 'relationshipQuestions': {
        const relType = wizardAnswers.relationshipType as RelationshipType;
        const questions = RELATIONSHIP_QUESTIONS[relType] || [];
        if (questions.length === 0) {
          return <p className="text-pretty text-base text-stone-600">No extra details needed.</p>;
        }

        return (
          <div className="flex max-w-2xl flex-col gap-8">
            {questions.map((q, idx) => (
              <div key={q.key} className="flex flex-col gap-3">
                <label className="text-base font-semibold text-stone-900" htmlFor={`relq-${q.key}`}>
                  {q.question}
                  {idx === 0 && <span className="ml-1 text-rose-700">*</span>}
                </label>
                {q.type === 'text' && (
                  <input
                    id={`relq-${q.key}`}
                    type="text"
                    value={(wizardAnswers[q.key] as string) || ''}
                    onChange={(e) => setWizardAnswer(q.key as keyof WizardAnswers, e.target.value)}
                    placeholder={q.placeholder}
                    className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-base text-stone-900 placeholder:text-stone-400 shadow-sm focus:border-stone-900 focus:outline-none focus:ring-2 focus:ring-rose-200"
                  />
                )}
                {q.type === 'pills' && q.options && (
                  <div className="flex flex-wrap gap-3">
                    {q.options.map((opt) => {
                      const checked = wizardAnswers[q.key] === opt.value;
                      return (
                        <PillToggle
                          key={opt.value}
                          name={q.key}
                          value={opt.value}
                          checked={checked}
                          label={opt.label}
                          onChange={() => setWizardAnswer(q.key as keyof WizardAnswers, opt.value)}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        );
      }

      case 'quickTraits': {
        const current = wizardAnswers.quickTraits || [];
        return (
          <fieldset className="w-full">
            <legend className="sr-only">Quick traits</legend>
            <div className="flex flex-wrap gap-3">
              {QUICK_TRAIT_OPTIONS.map((opt) => {
                const checked = current.includes(opt.value);
                return (
                  <PillToggle
                    key={opt.value}
                    name="quickTraits"
                    value={opt.value}
                    checked={checked}
                    label={opt.label}
                    emoji={opt.emoji}
                    onChange={() => {
                      if (checked) {
                        setWizardAnswer(
                          'quickTraits',
                          current.filter((t) => t !== opt.value),
                        );
                      } else {
                        setWizardAnswer('quickTraits', [...current, opt.value]);
                      }
                    }}
                  />
                );
              })}
            </div>
          </fieldset>
        );
      }

      case 'preview':
        return (
          <div className="flex w-full max-w-2xl flex-col gap-6">
            {generatedMessage ? (
              <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
                <p className="font-archivo text-xs font-semibold uppercase text-stone-500">Your message</p>
                <p className="mt-3 text-pretty text-base leading-relaxed text-stone-900 sm:text-lg">
                  {generatedMessage}
                </p>
                <p className="mt-5 text-right text-sm text-stone-600">For {wizardAnswers.name}</p>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-6 shadow-sm">
                <button
                  type="button"
                  onClick={handleGenerateMessage}
                  disabled={isGenerating}
                  className={cn(
                    'flex w-full items-center justify-center gap-2 rounded-xl border border-stone-200 bg-stone-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-400',
                  )}
                >
                  <Sparkles className="size-4" aria-hidden />
                  {isGenerating ? 'Generating...' : 'Generate a draft'}
                </button>
                {generationError && <p className="mt-3 text-pretty text-sm text-rose-700">{generationError}</p>}
              </div>
            )}

            <fieldset className="flex flex-col gap-3">
              <legend className="text-sm font-semibold text-stone-900">Choose a format</legend>
              <label
                className={cn(
                  'flex cursor-pointer items-center justify-between gap-4 rounded-2xl border bg-white p-5 shadow-sm transition-colors focus-within:ring-2 focus-within:ring-rose-200',
                  variant === 'physical' ? 'border-rose-600 ring-1 ring-rose-600' : 'border-stone-200 hover:border-stone-400',
                )}
              >
                <input
                  type="radio"
                  name="variant"
                  value="physical"
                  checked={variant === 'physical'}
                  onChange={() => setVariant('physical')}
                  className="sr-only"
                />
                <div className="min-w-0">
                  <p className="text-base font-semibold text-stone-900">Physical card</p>
                  <p className="mt-1 text-pretty text-sm text-stone-600">Printed and shipped</p>
                </div>
                <p className="tabular-nums text-base font-semibold text-stone-900">
                  ${(card.pricing.physical + 2).toFixed(2)}
                </p>
              </label>

              <label
                className={cn(
                  'flex cursor-pointer items-center justify-between gap-4 rounded-2xl border bg-white p-5 shadow-sm transition-colors focus-within:ring-2 focus-within:ring-rose-200',
                  variant === 'digital' ? 'border-rose-600 ring-1 ring-rose-600' : 'border-stone-200 hover:border-stone-400',
                )}
              >
                <input
                  type="radio"
                  name="variant"
                  value="digital"
                  checked={variant === 'digital'}
                  onChange={() => setVariant('digital')}
                  className="sr-only"
                />
                <div className="min-w-0">
                  <p className="text-base font-semibold text-stone-900">Digital download</p>
                  <p className="mt-1 text-pretty text-sm text-stone-600">Instant delivery</p>
                </div>
                <p className="tabular-nums text-base font-semibold text-stone-900">
                  ${(card.pricing.digital + 2).toFixed(2)}
                </p>
              </label>

              <p className="text-pretty text-center text-xs text-stone-500">Includes $2.00 personalization fee</p>
            </fieldset>
          </div>
        );

      default:
        return null;
    }
  };

  if (showIntro) {
    return (
      <div className="mx-auto flex h-dvh w-full max-w-3xl flex-col items-center justify-center overflow-hidden overscroll-none px-6 text-center">
        <div className="flex size-14 items-center justify-center rounded-full border border-stone-200 bg-white shadow-sm">
          <Sparkles className="size-6 text-stone-900" aria-hidden />
        </div>
        <h1 className="mt-6 font-libertinus text-4xl font-semibold leading-tight text-balance text-stone-900 sm:text-5xl">
          Let&apos;s write the card together.
        </h1>
        <p className="mt-4 max-w-xl text-pretty text-base text-stone-600 sm:text-lg">
          A few quick prompts, then a draft that sounds like you. Press <Kbd>Enter</Kbd> anytime to
          keep moving.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setIntroDismissed(true)}
            className="rounded-xl bg-stone-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-stone-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-200"
          >
            Start
          </button>
          <button
            type="button"
            onClick={() => setIntroDismissed(true)}
            className="rounded-xl border border-stone-200 bg-white px-6 py-3 text-sm font-semibold text-stone-900 shadow-sm transition-colors hover:border-stone-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-200"
          >
            Jump in
          </button>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="mx-auto flex h-dvh w-full max-w-3xl flex-col items-center justify-center overflow-hidden overscroll-none px-6 text-center">
        <div className="flex size-14 items-center justify-center rounded-full border border-stone-200 bg-white shadow-sm">
          <Check className="size-6 text-stone-900" aria-hidden />
        </div>
        <h1 className="mt-6 font-libertinus text-4xl font-semibold leading-tight text-balance text-stone-900 sm:text-5xl">
          Added to your cart.
        </h1>
        <p className="mt-4 max-w-xl text-pretty text-base text-stone-600 sm:text-lg">
          You can checkout now, or keep going and make another card.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/shop/checkout"
            className="rounded-xl bg-stone-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-stone-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-200"
          >
            Checkout
          </Link>
          <button
            type="button"
            onClick={() => {
              setDone(false);
              setAdded(false);
              resetWizard();
              onExit?.();
            }}
            className="rounded-xl border border-stone-200 bg-white px-6 py-3 text-sm font-semibold text-stone-900 shadow-sm transition-colors hover:border-stone-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-200"
          >
            Make another
          </button>
        </div>
        <p className="mt-6 hidden items-center justify-center gap-2 text-sm text-stone-500 sm:flex">
          Press <Kbd>Enter</Kbd> to open cart
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden overscroll-none">
      <header className="mx-auto flex w-full max-w-6xl shrink-0 items-center justify-between px-6 pt-8">
        <button
          type="button"
          onClick={() => {
            resetWizard();
            onExit?.();
          }}
          className="flex items-center gap-2 font-archivo text-lg font-bold text-stone-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-200"
        >
          <span className="size-2 rounded-full bg-rose-600" aria-hidden />
          AnydayCard
        </button>

        <div className="flex items-center gap-3">
          <p className="text-sm text-stone-500 tabular-nums">
            {stepNumber} of {totalSteps}
          </p>
          <button
            type="button"
            onClick={() => {
              resetWizard();
              onExit?.();
            }}
            aria-label="Exit guide"
            className="grid size-9 place-items-center rounded-full border border-stone-200 bg-white text-stone-700 shadow-sm transition-colors hover:border-stone-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-200"
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center overflow-hidden px-6 py-10">
        {stepCopy && (
          <div className="max-w-3xl">
            <p className="font-archivo text-xs font-semibold uppercase text-rose-700">
              Question {pad2(stepNumber)}
            </p>
            <h1 className="mt-4 font-libertinus text-4xl font-semibold leading-tight text-balance text-stone-900 sm:text-6xl">
              {stepCopy.title}
            </h1>
            {stepCopy.subtitle && (
              <p className="mt-4 max-w-2xl text-pretty text-base text-stone-600 sm:text-lg">
                {stepCopy.subtitle}
              </p>
            )}
            <div className="mt-8">{renderStep()}</div>
          </div>
        )}
      </main>

      <footer className="shrink-0 border-t border-stone-200 bg-stone-50">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 pb-[calc(env(safe-area-inset-bottom)+1.25rem)] pt-4">
          <button
            type="button"
            onClick={goBack}
            className="inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-stone-900 shadow-sm transition-colors hover:border-stone-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-200"
          >
            <ArrowLeft className="size-4" aria-hidden />
            {visibleStepIndex <= 0 ? 'Exit' : 'Back'}
          </button>

          <p className="hidden items-center gap-2 text-sm text-stone-500 sm:flex">
            {wizardStep === 'preview'
              ? generatedMessage
                ? <>Press <Kbd>Enter</Kbd> to add to cart</>
                : <>Press <Kbd>Enter</Kbd> to generate draft</>
              : <>Press <Kbd>Enter</Kbd> to continue</>}
          </p>

          {wizardStep === 'preview' ? (
            generatedMessage ? (
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={added}
                className={cn(
                  'inline-flex items-center gap-2 rounded-xl bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-stone-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-200 disabled:cursor-not-allowed disabled:bg-stone-400',
                )}
              >
                {added ? (
                  <>
                    <Check className="size-4" aria-hidden />
                    Added
                  </>
                ) : (
                  <>
                    Add to cart
                    <ArrowRight className="size-4" aria-hidden />
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleGenerateMessage}
                disabled={isGenerating}
                className={cn(
                  'inline-flex items-center gap-2 rounded-xl bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-stone-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-200 disabled:cursor-not-allowed disabled:bg-stone-400',
                )}
              >
                <Sparkles className="size-4" aria-hidden />
                {isGenerating ? 'Generating...' : 'Generate draft'}
              </button>
            )
          ) : (
            <button
              type="button"
              onClick={goNext}
              disabled={!canProceed}
              className={cn(
                'inline-flex items-center gap-2 rounded-xl bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-stone-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-200 disabled:cursor-not-allowed disabled:bg-stone-300 disabled:text-stone-500',
              )}
            >
              Next
              <ArrowRight className="size-4" aria-hidden />
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}
