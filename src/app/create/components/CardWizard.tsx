'use client';

import { ArrowLeft, Check, Gift, Sparkles } from 'lucide-react';
import { useCallback, useMemo, useRef, useState, useEffect } from 'react';

import { getEffectiveEndpoint } from '~/src/lib/ab-testing';
import { trackMessageGenerated, trackMessageRegenerated } from '~/src/lib/analytics';
import Button from '~/src/components/ui/Button';
import { cn } from '~/src/util';

import { useCartStore } from '../../(main)/shop/store';
import type {
  Card,
  CardVariant,
  RelationshipType,
  WizardAnswers,
  WizardStep,
} from '../models';
import { useCardStore } from '../store';
import {
  HEARTFELT_OPTIONS,
  HUMOR_OPTIONS,
  OCCASION_OPTIONS,
  QUICK_TRAIT_OPTIONS,
  RELATIONSHIP_OPTIONS,
  RELATIONSHIP_QUESTIONS,
  STEP_LABELS,
  STEP_ORDER,
  VIBE_OPTIONS,
} from './cardWizardConfig';

type Props = {
  card: Card;
  onComplete?: () => void;
  onBack?: () => void;
  size?: 'default' | 'fullscreen';
};

function PillButton({
  selected,
  onClick,
  children,
  emoji,
  size = 'default',
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  emoji?: string;
  size?: 'default' | 'fullscreen';
}) {
  const isFullscreen = size === 'fullscreen';
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors',
        isFullscreen && 'px-4 py-2 text-base',
        selected
          ? isFullscreen
            ? 'border-stone-900 bg-stone-900 text-white'
            : 'border-stone-900 bg-stone-900 text-white'
          : isFullscreen
            ? 'border-stone-300 bg-white text-stone-800 hover:border-stone-500'
            : 'border-stone-300 bg-white text-stone-700 hover:border-stone-500',
      )}
    >
      {emoji && <span className="text-base">{emoji}</span>}
      {children}
    </button>
  );
}

function OptionCard({
  selected,
  onClick,
  title,
  description,
  size = 'default',
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  description: string;
  size?: 'default' | 'fullscreen';
}) {
  const isFullscreen = size === 'fullscreen';
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex flex-col gap-0.5 rounded-lg border p-3 text-left transition-colors',
        isFullscreen && 'p-4',
        selected
          ? isFullscreen
            ? 'border-stone-900 bg-white shadow-[0_6px_14px_rgba(0,0,0,0.08)]'
            : 'border-stone-900 bg-white shadow-[0_6px_14px_rgba(0,0,0,0.08)]'
          : isFullscreen
            ? 'border-stone-300 bg-white hover:border-stone-500'
            : 'border-stone-300 bg-white hover:border-stone-500',
      )}
    >
      <span className={cn('font-medium text-stone-800', isFullscreen && 'text-lg text-stone-900')}>
        {title}
      </span>
      <span className={cn('text-xs text-stone-600', isFullscreen && 'text-sm text-stone-600')}>
        {description}
      </span>
    </button>
  );
}

export default function CardWizard({ card, onComplete, onBack, size = 'default' }: Props) {
  const wizardStep = useCardStore((s) => s.wizardStep);
  const wizardAnswers = useCardStore((s) => s.wizardAnswers);
  const setWizardStep = useCardStore((s) => s.setWizardStep);
  const setWizardAnswer = useCardStore((s) => s.setWizardAnswer);
  const resetWizard = useCardStore((s) => s.resetWizard);
  const isFullscreen = size === 'fullscreen';

  const [variant, setVariant] = useState<CardVariant>('digital');
  const [generatedMessage, setGeneratedMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const regenerationCountRef = useRef(0);
  const [added, setAdded] = useState(false);
  const [introDismissed, setIntroDismissed] = useState(false);

  const addItem = useCartStore((s) => s.addItem);
  const setCartOpen = useCartStore((s) => s.setOpen);

  const currentStepIndex = STEP_ORDER.indexOf(wizardStep);

  // Calculate progress percentage
  const progress = useMemo(() => {
    const answered = Object.keys(wizardAnswers).filter((key) => {
      const value = wizardAnswers[key as keyof WizardAnswers];
      if (Array.isArray(value)) return value.length > 0;
      return Boolean(value);
    }).length;
    // Rough estimate: name + relationship + occasion + vibes + at least some relationship questions
    const totalExpected = 8;
    return Math.min(100, Math.round((answered / totalExpected) * 100));
  }, [wizardAnswers]);

  // Determine which steps to show based on vibe selection
  const getVisibleSteps = useCallback((): WizardStep[] => {
    const vibes = wizardAnswers.vibes || [];
    const hasFunny = vibes.includes('funny');
    const hasHeartfelt = vibes.includes('heartfelt') || vibes.includes('grateful') || vibes.includes('nostalgic');

    const steps: WizardStep[] = ['name', 'relationship', 'occasion', 'vibe'];

    if (hasFunny) steps.push('humorType');
    if (hasHeartfelt) steps.push('heartfeltDepth');

    steps.push('relationshipQuestions', 'quickTraits', 'preview');

    return steps;
  }, [wizardAnswers.vibes]);

  const visibleSteps = getVisibleSteps();
  const visibleStepIndex = visibleSteps.indexOf(wizardStep);

  const goToStep = useCallback(
    (step: WizardStep) => {
      setWizardStep(step);
    },
    [setWizardStep],
  );

  const goNext = useCallback(() => {
    const nextIndex = visibleStepIndex + 1;
    if (nextIndex < visibleSteps.length) {
      goToStep(visibleSteps[nextIndex]);
    }
  }, [visibleStepIndex, visibleSteps, goToStep]);

  const goBack = useCallback(() => {
    if (visibleStepIndex === 0) {
      resetWizard();
      onBack?.();
      return;
    }
    const prevIndex = visibleStepIndex - 1;
    if (prevIndex >= 0) {
      goToStep(visibleSteps[prevIndex]);
    }
  }, [visibleStepIndex, visibleSteps, goToStep, resetWizard, onBack]);

  const handleGenerateMessage = async () => {
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

      // Track analytics with cohort and version
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
      console.error('[Wizard] Generate message error:', error);
      setGenerationError('Could not generate a message. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddToCart = () => {
    addItem(card, variant, 1, {
      recipientName: wizardAnswers.name || '',
      relationship: wizardAnswers.relationshipType || '',
      occasion: wizardAnswers.occasion || card.occasion,
      message: generatedMessage,
      wizardAnswers: wizardAnswers as WizardAnswers,
      generatedAt: new Date().toISOString(),
    });
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      setCartOpen(true);
      resetWizard();
      onComplete?.();
    }, 1000);
  };

  // Can proceed validators
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
      case 'relationshipQuestions':
        // At least answer the first question
        const questions = RELATIONSHIP_QUESTIONS[wizardAnswers.relationshipType as RelationshipType] || [];
        if (questions.length === 0) return true;
        return Boolean(wizardAnswers[questions[0].key]);
      case 'quickTraits':
        return true; // Optional
      case 'preview':
        return true;
      default:
        return true;
    }
  }, [wizardStep, wizardAnswers]);

  useEffect(() => {
    if (wizardStep === 'preview') return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Enter') return;
      const target = event.target as HTMLElement | null;
      if (target?.tagName === 'TEXTAREA') return;
      if (target?.tagName === 'INPUT') return;
      if (!canProceed) return;
      event.preventDefault();
      goNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [wizardStep, canProceed, goNext]);

  const renderStep = () => {
    switch (wizardStep) {
      case 'name':
        return (
          <div className="flex flex-col gap-4">
            <div>
              <label
                className={cn(
                  'mb-2 block text-sm font-medium text-stone-800',
                  isFullscreen && 'text-base text-stone-900'
                )}
              >
                Who is this card for?
              </label>
                <input
                  type="text"
                  value={wizardAnswers.name || ''}
                  onChange={(e) => {
                    setWizardAnswer('name', e.target.value);
                  }}
                  onKeyDown={(e) => {
                    if (e.key !== 'Enter') return;
                    if (!e.currentTarget.value.trim()) return;
                    e.preventDefault();
                    e.stopPropagation();
                    goNext();
                  }}
                  placeholder="Enter their name"
                  autoFocus
                  className={cn(
                    'w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-800 placeholder:text-stone-500 focus:border-stone-600 focus:outline-none',
                    isFullscreen &&
                    'bg-white px-4 py-3 text-lg text-stone-900 placeholder:text-stone-500 border-stone-300 focus:border-stone-500'
                )}
              />
            </div>
          </div>
        );

      case 'relationship':
        return (
          <div className="flex flex-col gap-4">
            <label
              className={cn(
                'text-sm font-medium text-stone-800',
                isFullscreen && 'text-base text-stone-900'
              )}
            >
              What&apos;s your relationship with {wizardAnswers.name || 'them'}?
            </label>
            <div className="flex flex-wrap gap-2">
              {RELATIONSHIP_OPTIONS.map((opt) => (
                <PillButton
                  key={opt.value}
                  selected={wizardAnswers.relationshipType === opt.value}
                  onClick={() => setWizardAnswer('relationshipType', opt.value)}
                  emoji={opt.emoji}
                  size={size}
                >
                  {opt.label}
                </PillButton>
              ))}
            </div>
          </div>
        );

      case 'occasion':
        return (
          <div className="flex flex-col gap-4">
            <label
              className={cn(
                'text-sm font-medium text-stone-800',
                isFullscreen && 'text-base text-stone-900'
              )}
            >
              What&apos;s the occasion?
            </label>
            <div className="flex flex-wrap gap-2">
              {OCCASION_OPTIONS.map((opt) => (
                <PillButton
                  key={opt.value}
                  selected={wizardAnswers.occasion === opt.value}
                  onClick={() => setWizardAnswer('occasion', opt.value)}
                  emoji={opt.emoji}
                  size={size}
                >
                  {opt.label}
                </PillButton>
              ))}
            </div>
          </div>
        );

      case 'vibe':
        return (
          <div className="flex flex-col gap-4">
            <div>
              <label
                className={cn(
                  'text-sm font-medium text-stone-800',
                  isFullscreen && 'text-base text-stone-900'
                )}
              >
                What vibe should this card have?
              </label>
              <p className={cn('mt-1 text-xs text-stone-600', isFullscreen && 'text-sm text-stone-600')}>
                Select all that apply
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {VIBE_OPTIONS.map((opt) => {
                const selected = wizardAnswers.vibes?.includes(opt.value) || false;
                return (
                  <PillButton
                    key={opt.value}
                    selected={selected}
                    onClick={() => {
                      const current = wizardAnswers.vibes || [];
                      if (selected) {
                        setWizardAnswer(
                          'vibes',
                          current.filter((v) => v !== opt.value),
                        );
                      } else {
                        setWizardAnswer('vibes', [...current, opt.value]);
                      }
                    }}
                    emoji={opt.emoji}
                    size={size}
                  >
                    {opt.label}
                  </PillButton>
                );
              })}
            </div>
          </div>
        );

      case 'humorType':
        return (
          <div className="flex flex-col gap-4">
            <label
              className={cn(
                'text-sm font-medium text-stone-800',
                isFullscreen && 'text-base text-stone-900'
              )}
            >
              What kind of humor?
            </label>
            <div className="grid gap-2">
              {HUMOR_OPTIONS.map((opt) => (
                <OptionCard
                  key={opt.value}
                  selected={wizardAnswers.humorType === opt.value}
                  onClick={() => setWizardAnswer('humorType', opt.value)}
                  title={opt.label}
                  description={opt.description}
                  size={size}
                />
              ))}
            </div>
          </div>
        );

      case 'heartfeltDepth':
        return (
          <div className="flex flex-col gap-4">
            <label
              className={cn(
                'text-sm font-medium text-stone-800',
                isFullscreen && 'text-base text-stone-900'
              )}
            >
              How deep should we go?
            </label>
            <div className="grid gap-2">
              {HEARTFELT_OPTIONS.map((opt) => (
                <OptionCard
                  key={opt.value}
                  selected={wizardAnswers.heartfeltDepth === opt.value}
                  onClick={() => setWizardAnswer('heartfeltDepth', opt.value)}
                  title={opt.label}
                  description={opt.description}
                  size={size}
                />
              ))}
            </div>
          </div>
        );

      case 'relationshipQuestions':
        const relType = wizardAnswers.relationshipType as RelationshipType;
        const questions = RELATIONSHIP_QUESTIONS[relType] || [];
        if (questions.length === 0) {
          return (
            <div className="flex flex-col gap-4">
              <p className={cn('text-sm text-stone-600', isFullscreen && 'text-base')}>
                No additional questions for this relationship type.
              </p>
            </div>
          );
        }
        return (
          <div className="flex flex-col gap-5">
            <p className={cn('text-xs text-stone-600', isFullscreen && 'text-sm text-stone-600')}>
              These details help create a more personal message
            </p>
            {questions.map((q) => (
              <div key={q.key} className="flex flex-col gap-2">
                <label
                  className={cn(
                    'text-sm font-medium text-stone-800',
                    isFullscreen && 'text-base text-stone-900'
                  )}
                >
                  {q.question}
                </label>
                {q.type === 'text' && (
                  <input
                    type="text"
                    value={(wizardAnswers[q.key] as string) || ''}
                    onChange={(e) => setWizardAnswer(q.key as keyof WizardAnswers, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key !== 'Enter') return;
                      if (!e.currentTarget.value.trim()) return;
                      e.preventDefault();
                      e.stopPropagation();
                      if (canProceed) goNext();
                    }}
                    placeholder={q.placeholder}
                    className={cn(
                      'w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-800 placeholder:text-stone-500 focus:border-stone-600 focus:outline-none',
                      isFullscreen &&
                        'bg-white px-4 py-3 text-base text-stone-900 placeholder:text-stone-500 border-stone-300 focus:border-stone-500'
                    )}
                  />
                )}
                {q.type === 'pills' && q.options && (
                  <div className="flex flex-wrap gap-2">
                    {q.options.map((opt) => (
                      <PillButton
                        key={opt.value}
                        selected={wizardAnswers[q.key] === opt.value}
                        onClick={() => setWizardAnswer(q.key as keyof WizardAnswers, opt.value)}
                        size={size}
                      >
                        {opt.label}
                      </PillButton>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        );

      case 'quickTraits':
        return (
          <div className="flex flex-col gap-4">
            <div>
              <label
                className={cn(
                  'text-sm font-medium text-stone-800',
                  isFullscreen && 'text-base text-stone-900'
                )}
              >
                Quick traits about {wizardAnswers.name || 'them'}
              </label>
              <p className={cn('mt-1 text-xs text-stone-600', isFullscreen && 'text-sm text-stone-600')}>
                Select any that apply (optional)
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {QUICK_TRAIT_OPTIONS.map((opt) => {
                const selected = wizardAnswers.quickTraits?.includes(opt.value) || false;
                return (
                  <PillButton
                    key={opt.value}
                    selected={selected}
                    onClick={() => {
                      const current = wizardAnswers.quickTraits || [];
                      if (selected) {
                        setWizardAnswer(
                          'quickTraits',
                          current.filter((t) => t !== opt.value),
                        );
                      } else {
                        setWizardAnswer('quickTraits', [...current, opt.value]);
                      }
                    }}
                    emoji={opt.emoji}
                    size={size}
                  >
                    {opt.label}
                  </PillButton>
                );
              })}
            </div>
          </div>
        );

      case 'preview':
        return (
          <div className="flex flex-col gap-4">
            {/* Generated message or generate button */}
            {generatedMessage ? (
              <div className={cn('rounded-lg border border-stone-300 bg-white p-4 shadow-[0_6px_16px_rgba(0,0,0,0.08)]', isFullscreen && 'border-stone-300 bg-white shadow-[0_8px_24px_rgba(0,0,0,0.08)]')}>
                <p
                  className={cn(
                    'mb-2 text-xs font-medium uppercase tracking-wide text-stone-600',
                    isFullscreen && 'text-sm text-stone-600'
                  )}
                >
                  Your personalized message
                </p>
                <p className={cn('text-sm leading-relaxed text-stone-800', isFullscreen && 'text-base text-stone-900')}>
                  {generatedMessage}
                </p>
                <p className={cn('mt-3 text-right text-sm text-stone-700', isFullscreen && 'text-base text-stone-700')}>
                  — For {wizardAnswers.name}
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={handleGenerateMessage}
                  disabled={isGenerating}
                  className={cn(
                    'flex items-center justify-center gap-2 rounded-lg border border-dashed border-stone-300 bg-white p-4 text-sm text-stone-700 hover:border-stone-500 hover:text-stone-900',
                    isFullscreen && 'p-5 text-base border-stone-400 text-stone-700 hover:border-stone-600 hover:text-stone-900'
                  )}
                >
                  <Sparkles className="size-4" />
                  {isGenerating ? 'Generating your message...' : 'Generate personalized message'}
                </button>
                {generationError && (
                  <p className={cn('text-sm text-red-700', isFullscreen && 'text-base text-red-700')}>
                    {generationError}
                  </p>
                )}
              </div>
            )}

            {/* Variant selection */}
            <div className="flex flex-col gap-2">
              <label
                className={cn(
                  'flex cursor-pointer items-center gap-3 rounded-lg border border-stone-300 bg-white p-3 transition-colors hover:border-stone-500',
                  isFullscreen && 'border-stone-300 bg-white hover:border-stone-500'
                )}
              >
                <input
                  type="radio"
                  name="variant"
                  value="physical"
                  checked={variant === 'physical'}
                  onChange={() => setVariant('physical')}
                  className={cn('size-4 accent-text-primary', isFullscreen && 'accent-stone-800')}
                />
                <div className="flex flex-1 items-center justify-between">
                  <div>
                    <div className={cn('font-medium text-stone-800', isFullscreen && 'text-stone-900')}>
                      Physical Card
                    </div>
                    <div className={cn('text-sm text-stone-600', isFullscreen && 'text-stone-600')}>
                      Printed & shipped
                    </div>
                  </div>
                  <div className={cn('font-medium text-stone-800', isFullscreen && 'text-stone-900')}>
                    ${(card.pricing.physical + 2).toFixed(2)}
                  </div>
                </div>
              </label>

              <label
                className={cn(
                  'flex cursor-pointer items-center gap-3 rounded-lg border border-stone-300 bg-white p-3 transition-colors hover:border-stone-500',
                  isFullscreen && 'border-stone-300 bg-white hover:border-stone-500'
                )}
              >
                <input
                  type="radio"
                  name="variant"
                  value="digital"
                  checked={variant === 'digital'}
                  onChange={() => setVariant('digital')}
                  className={cn('size-4 accent-text-primary', isFullscreen && 'accent-stone-800')}
                />
                <div className="flex flex-1 items-center justify-between">
                  <div>
                    <div className={cn('font-medium text-stone-800', isFullscreen && 'text-stone-900')}>
                      Digital Download
                    </div>
                    <div className={cn('text-sm text-stone-600', isFullscreen && 'text-stone-600')}>
                      Instant delivery
                    </div>
                  </div>
                  <div className={cn('font-medium text-stone-800', isFullscreen && 'text-stone-900')}>
                    ${(card.pricing.digital + 2).toFixed(2)}
                  </div>
                </div>
              </label>

              <p className={cn('text-center text-xs text-stone-600', isFullscreen && 'text-stone-600')}>
                Includes $2.00 personalization fee
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const stepContext = useMemo(() => {
    const name = wizardAnswers.name?.trim() || 'them';
    switch (wizardStep) {
      case 'name':
        return {
          title: "I’ll be your card guide.",
          body: 'Let’s start with a name so every next choice feels personal.',
        };
      case 'relationship':
        return {
          title: 'How do you know them?',
          body: `This sets the voice we’ll use for ${name}.`,
        };
      case 'occasion':
        return {
          title: 'What moment are we honoring?',
          body: 'Occasion gives the message its frame and rhythm.',
        };
      case 'vibe':
        return {
          title: 'Choose the feeling.',
          body: 'Pick one or blend a few. We’ll write to that mood.',
        };
      case 'humorType':
        return {
          title: 'How should the humor land?',
          body: 'We’ll match it to your relationship so it feels right.',
        };
      case 'heartfeltDepth':
        return {
          title: 'How deep should this go?',
          body: 'Light and sweet, or full‑heart. You decide.',
        };
      case 'relationshipQuestions':
        return {
          title: 'Add a real detail.',
          body: 'One true moment beats a dozen generic lines.',
        };
      case 'quickTraits':
        return {
          title: 'Quick traits (optional).',
          body: 'Small specifics make it feel written by you.',
        };
      case 'preview':
        return {
          title: 'Here’s the first draft.',
          body: 'We can revise or regenerate. This is just the start.',
        };
      default:
        return null;
    }
  }, [wizardStep, wizardAnswers.name]);

  const hasAnyAnswers = useMemo(() => {
    return Object.values(wizardAnswers).some((value) => {
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === 'string') return value.trim().length > 0;
      return Boolean(value);
    });
  }, [wizardAnswers]);

  const showIntro = isFullscreen && wizardStep === 'name' && !introDismissed && !hasAnyAnswers;

  if (showIntro) {
    return (
      <div className={cn('flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center', isFullscreen && 'py-6')}>
        <div className="flex size-14 items-center justify-center rounded-full border border-stone-300 bg-white shadow-[0_8px_18px_rgba(0,0,0,0.08)]">
          <Gift className="size-6 text-stone-800" />
        </div>
        <div className="space-y-2">
          <h2 className={cn('text-2xl font-semibold text-stone-900', isFullscreen && 'text-3xl')}>
            Let&apos;s write the card together.
          </h2>
          <p className={cn('text-sm text-stone-700', isFullscreen && 'text-base')}>
            A few quick prompts, then a draft that sounds like you.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button
            onClick={() => setIntroDismissed(true)}
            variant="secondary"
            className={cn('px-6', isFullscreen && 'py-3 text-base')}
          >
            Start the guide
          </Button>
          <Button
            onClick={() => setIntroDismissed(true)}
            variant="text"
            className={cn('px-4 text-stone-700 hover:text-stone-900', isFullscreen && 'py-3 text-base')}
          >
            Jump right in
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col gap-4', isFullscreen && 'text-stone-900')}>
      {stepContext && (
        <div
          className={cn(
            'rounded-2xl border border-stone-300 bg-white/95 px-4 py-3 text-stone-900 shadow-[0_12px_30px_rgba(0,0,0,0.18)] backdrop-blur-sm',
            isFullscreen && 'px-6 py-4'
          )}
        >
          <p className={cn('text-sm font-semibold', isFullscreen && 'text-lg')}>
            {stepContext.title}
          </p>
          <p className={cn('mt-1 text-xs text-stone-700', isFullscreen && 'text-base')}>
            {stepContext.body}
          </p>
        </div>
      )}

      {/* Progress bar */}
      <div className="flex items-center gap-3">
        <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-stone-200">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-stone-800 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className={cn('text-xs tabular-nums text-stone-600', isFullscreen && 'text-sm')}>
          {progress}%
        </span>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        <span className={cn('text-xs font-semibold uppercase tracking-wide text-stone-800', isFullscreen && 'text-sm')}>
          {STEP_LABELS[wizardStep]}
        </span>
        <span className={cn('text-xs text-stone-600', isFullscreen && 'text-sm')}>
          ({visibleStepIndex + 1}/{visibleSteps.length})
        </span>
      </div>

      {/* Step content */}
      <div className={cn('min-h-[200px]', isFullscreen && 'min-h-[260px]')}>{renderStep()}</div>

      {/* Navigation */}
      <div className="flex items-center gap-2 pt-2">
        <Button
          onClick={goBack}
          variant="text"
          className={cn(
            'flex items-center gap-1',
            isFullscreen && 'py-3 text-base text-stone-700 hover:text-stone-900'
          )}
        >
          <ArrowLeft className="size-4" />
          {visibleStepIndex === 0 ? 'Cancel' : 'Back'}
        </Button>
        {wizardStep === 'preview' ? (
          <Button
            onClick={handleAddToCart}
            variant="secondary"
            className="ml-auto shrink-0"
            buttonClassName={cn(
              'px-6 py-2 text-sm whitespace-nowrap',
              isFullscreen && 'py-3 text-base',
            )}
          >
            {added ? (
              <span className="flex items-center gap-1">
                <Check className="size-4" /> Added!
              </span>
            ) : (
              'Add to Cart'
            )}
          </Button>
        ) : (
          <Button
            onClick={goNext}
            disabled={!canProceed}
            variant="secondary"
            className="ml-auto shrink-0"
            buttonClassName={cn(
              'px-6 py-2 text-sm whitespace-nowrap',
              isFullscreen && 'py-3 text-base',
              canProceed
                ? 'bg-stone-900 text-white hover:bg-stone-800'
                : 'bg-stone-300 text-stone-500 cursor-not-allowed',
            )}
          >
            Continue
          </Button>
        )}
      </div>
    </div>
  );
}
