'use client';

import { ArrowLeft, Check, Sparkles } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';

import Button from '~/src/components/ui/Button';
import { cn } from '~/src/util';

import { useCartStore } from '../../(main)/shop/store';
import type {
  Card,
  CardVariant,
  HeartfeltDepth,
  HumorType,
  OccasionType,
  QuickTrait,
  RelationshipType,
  VibeType,
  WizardAnswers,
  WizardStep,
} from '../models';
import { useCardStore } from '../store';

type Props = {
  card: Card;
  onComplete?: () => void;
  onBack?: () => void;
};

const STEP_ORDER: WizardStep[] = [
  'name',
  'relationship',
  'occasion',
  'vibe',
  'humorType',
  'heartfeltDepth',
  'relationshipQuestions',
  'quickTraits',
  'preview',
];

const STEP_LABELS: Record<WizardStep, string> = {
  name: 'Recipient',
  relationship: 'Relationship',
  occasion: 'Occasion',
  vibe: 'Vibe',
  humorType: 'Humor Style',
  heartfeltDepth: 'Depth',
  relationshipQuestions: 'Details',
  quickTraits: 'Traits',
  preview: 'Preview',
};

const RELATIONSHIP_OPTIONS: { value: RelationshipType; label: string; emoji: string }[] = [
  { value: 'partner', label: 'Partner', emoji: '💕' },
  { value: 'friend', label: 'Friend', emoji: '🤝' },
  { value: 'parent', label: 'Parent', emoji: '👨‍👩‍👧' },
  { value: 'child', label: 'Child', emoji: '👶' },
  { value: 'sibling', label: 'Sibling', emoji: '👯' },
  { value: 'professional', label: 'Professional', emoji: '💼' },
  { value: 'dating', label: 'Dating', emoji: '💋' },
  { value: 'grandparent', label: 'Grandparent', emoji: '👴' },
  { value: 'other', label: 'Other', emoji: '✨' },
];

const OCCASION_OPTIONS: { value: OccasionType; label: string; emoji: string }[] = [
  { value: 'birthday', label: 'Birthday', emoji: '🎂' },
  { value: 'anniversary', label: 'Anniversary', emoji: '💍' },
  { value: 'holiday', label: 'Holiday', emoji: '🎄' },
  { value: 'support', label: 'Support', emoji: '🤗' },
  { value: 'achievement', label: 'Achievement', emoji: '🏆' },
  { value: 'miss', label: 'Missing You', emoji: '💭' },
  { value: 'justBecause', label: 'Just Because', emoji: '💝' },
  { value: 'apology', label: 'Apology', emoji: '🙏' },
  { value: 'thanks', label: 'Thank You', emoji: '🙌' },
  { value: 'congratulations', label: 'Congrats', emoji: '🎉' },
];

const VIBE_OPTIONS: { value: VibeType; label: string; emoji: string }[] = [
  { value: 'funny', label: 'Funny', emoji: '😂' },
  { value: 'heartfelt', label: 'Heartfelt', emoji: '❤️' },
  { value: 'spicy', label: 'Spicy', emoji: '🌶️' },
  { value: 'weird', label: 'Weird', emoji: '🤪' },
  { value: 'grateful', label: 'Grateful', emoji: '🙏' },
  { value: 'nostalgic', label: 'Nostalgic', emoji: '📷' },
  { value: 'encouraging', label: 'Encouraging', emoji: '💪' },
  { value: 'apologetic', label: 'Apologetic', emoji: '😔' },
  { value: 'proud', label: 'Proud', emoji: '🌟' },
  { value: 'playful', label: 'Playful', emoji: '😜' },
];

const HUMOR_OPTIONS: { value: HumorType; label: string; description: string }[] = [
  { value: 'insideJokes', label: 'Inside Jokes', description: 'References only you two get' },
  { value: 'playfulTeasing', label: 'Playful Teasing', description: 'Lovingly poking fun' },
  { value: 'absurdist', label: 'Absurdist', description: 'Random and chaotic' },
  { value: 'dryDeadpan', label: 'Dry & Deadpan', description: 'Subtle and understated' },
  { value: 'selfDeprecating', label: 'Self-Deprecating', description: 'Making fun of yourself' },
  { value: 'wholesomeSilly', label: 'Wholesome Silly', description: 'Sweet and goofy' },
];

const HEARTFELT_OPTIONS: { value: HeartfeltDepth; label: string; description: string }[] = [
  { value: 'warmLight', label: 'Warm & Light', description: 'Sweet but not too heavy' },
  { value: 'feelSeen', label: 'Feel Seen', description: 'Deeply personal and meaningful' },
  { value: 'mightCry', label: 'Might Cry', description: 'All the feelings' },
];

const QUICK_TRAIT_OPTIONS: { value: QuickTrait; label: string; emoji: string }[] = [
  { value: 'dogPerson', label: 'Dog Person', emoji: '🐕' },
  { value: 'catPerson', label: 'Cat Person', emoji: '🐱' },
  { value: 'coffeeAddict', label: 'Coffee Addict', emoji: '☕' },
  { value: 'teaDrinker', label: 'Tea Drinker', emoji: '🍵' },
  { value: 'gymRat', label: 'Gym Rat', emoji: '🏋️' },
  { value: 'hatesMornings', label: 'Hates Mornings', emoji: '😴' },
  { value: 'alwaysLate', label: 'Always Late', emoji: '⏰' },
  { value: 'plantParent', label: 'Plant Parent', emoji: '🌿' },
  { value: 'gamer', label: 'Gamer', emoji: '🎮' },
  { value: 'bookworm', label: 'Bookworm', emoji: '📚' },
  { value: 'foodie', label: 'Foodie', emoji: '🍜' },
  { value: 'homebody', label: 'Homebody', emoji: '🏠' },
  { value: 'overthinker', label: 'Overthinker', emoji: '🧠' },
  { value: 'crierAtMovies', label: 'Cries at Movies', emoji: '😭' },
  { value: 'neatFreak', label: 'Neat Freak', emoji: '✨' },
  { value: 'creativeMess', label: 'Creative Mess', emoji: '🎨' },
  { value: 'workaholic', label: 'Workaholic', emoji: '💻' },
  { value: 'adventureSeeker', label: 'Adventure Seeker', emoji: '🧗' },
  { value: 'introvert', label: 'Introvert', emoji: '🤫' },
  { value: 'lifeOfTheParty', label: 'Life of the Party', emoji: '🎊' },
];

// Relationship-specific questions
interface RelationshipQuestion {
  key: string;
  question: string;
  type: 'text' | 'select' | 'pills';
  options?: { value: string; label: string }[];
  placeholder?: string;
}

const RELATIONSHIP_QUESTIONS: Record<RelationshipType, RelationshipQuestion[]> = {
  partner: [
    {
      key: 'partnerSubtype',
      question: 'What kind of partner?',
      type: 'pills',
      options: [
        { value: 'spouse', label: 'Spouse' },
        { value: 'boyfriend', label: 'Boyfriend' },
        { value: 'girlfriend', label: 'Girlfriend' },
        { value: 'partner', label: 'Partner' },
        { value: 'fiance', label: 'Fiancé(e)' },
      ],
    },
    {
      key: 'partnerDuration',
      question: 'How long have you been together?',
      type: 'pills',
      options: [
        { value: 'new', label: 'Just started' },
        { value: '1year', label: '~1 year' },
        { value: 'years', label: 'Several years' },
        { value: 'decade', label: 'A decade+' },
      ],
    },
    {
      key: 'partnerRecentMoment',
      question: 'A recent moment that made you smile?',
      type: 'text',
      placeholder: 'e.g., When they made me coffee without asking',
    },
    {
      key: 'partnerTheirThing',
      question: "What's something they're obsessed with?",
      type: 'text',
      placeholder: 'e.g., True crime podcasts, houseplants',
    },
    {
      key: 'partnerInsideJoke',
      question: 'An inside joke or phrase only you two get?',
      type: 'text',
      placeholder: 'Optional - makes it extra personal',
    },
  ],
  friend: [
    {
      key: 'friendTexture',
      question: 'What kind of friendship?',
      type: 'pills',
      options: [
        { value: 'bestie', label: 'Best friend' },
        { value: 'old', label: 'Old friend' },
        { value: 'new', label: 'New friend' },
        { value: 'workFriend', label: 'Work friend' },
        { value: 'distantClose', label: 'Distant but close' },
      ],
    },
    {
      key: 'friendHowMet',
      question: 'How did you meet?',
      type: 'text',
      placeholder: 'e.g., College roommates, through mutual friends',
    },
    {
      key: 'friendSharedMemory',
      question: 'A favorite memory together?',
      type: 'text',
      placeholder: 'e.g., That road trip where we got lost',
    },
    {
      key: 'friendTheyreTheOneWho',
      question: "They're the one who...",
      type: 'text',
      placeholder: 'e.g., always answers at 2am, makes the best playlists',
    },
    {
      key: 'friendInsideJoke',
      question: 'An inside joke?',
      type: 'text',
      placeholder: 'Optional',
    },
  ],
  parent: [
    {
      key: 'parentWhich',
      question: 'Which parent?',
      type: 'pills',
      options: [
        { value: 'mom', label: 'Mom' },
        { value: 'dad', label: 'Dad' },
        { value: 'stepmom', label: 'Stepmom' },
        { value: 'stepdad', label: 'Stepdad' },
        { value: 'parentFigure', label: 'Parent figure' },
      ],
    },
    {
      key: 'parentRelationshipVibe',
      question: "What's your relationship like?",
      type: 'pills',
      options: [
        { value: 'close', label: 'Very close' },
        { value: 'loving', label: 'Loving but distant' },
        { value: 'complicated', label: 'Complicated' },
        { value: 'reconnecting', label: 'Reconnecting' },
      ],
    },
    {
      key: 'parentTaughtYou',
      question: 'Something they taught you?',
      type: 'text',
      placeholder: 'e.g., How to change a tire, to always be kind',
    },
    {
      key: 'parentAlwaysSays',
      question: 'Something they always say?',
      type: 'text',
      placeholder: 'e.g., "Call me when you get home"',
    },
    {
      key: 'parentChildhoodMemory',
      question: 'A childhood memory with them?',
      type: 'text',
      placeholder: 'Optional',
    },
  ],
  child: [
    {
      key: 'childAge',
      question: 'How old are they?',
      type: 'pills',
      options: [
        { value: 'baby', label: 'Baby/Toddler' },
        { value: 'kid', label: 'Kid (5-12)' },
        { value: 'teen', label: 'Teen' },
        { value: 'youngAdult', label: 'Young adult' },
        { value: 'adult', label: 'Adult' },
      ],
    },
    {
      key: 'childCurrentPhase',
      question: "What's their current phase?",
      type: 'text',
      placeholder: 'e.g., Dinosaurs, starting college, new job',
    },
    {
      key: 'childProudMoment',
      question: 'Something that made you proud recently?',
      type: 'text',
      placeholder: 'e.g., Stood up for a friend, got their first job',
    },
    {
      key: 'childPersonality',
      question: "They're the kind of kid who...",
      type: 'text',
      placeholder: 'e.g., makes everyone laugh, always has a book',
    },
  ],
  sibling: [
    {
      key: 'siblingType',
      question: 'What kind of sibling?',
      type: 'pills',
      options: [
        { value: 'sister', label: 'Sister' },
        { value: 'brother', label: 'Brother' },
        { value: 'stepSibling', label: 'Step-sibling' },
        { value: 'halfSibling', label: 'Half-sibling' },
        { value: 'siblingInLaw', label: 'In-law' },
      ],
    },
    {
      key: 'siblingBirthOrder',
      question: 'Birth order?',
      type: 'pills',
      options: [
        { value: 'older', label: 'Older than me' },
        { value: 'younger', label: 'Younger than me' },
        { value: 'twin', label: 'Twin' },
      ],
    },
    {
      key: 'siblingDynamicNow',
      question: "What's your dynamic now?",
      type: 'pills',
      options: [
        { value: 'bestFriends', label: 'Best friends' },
        { value: 'closeish', label: 'Close-ish' },
        { value: 'lovinglyAnnoying', label: 'Lovingly annoying' },
        { value: 'reconnecting', label: 'Reconnecting' },
      ],
    },
    {
      key: 'siblingChildhoodMemory',
      question: 'A childhood memory together?',
      type: 'text',
      placeholder: 'e.g., Building forts, fighting over the remote',
    },
    {
      key: 'siblingInsideJoke',
      question: 'An inside joke?',
      type: 'text',
      placeholder: 'Optional',
    },
  ],
  professional: [
    {
      key: 'professionalType',
      question: 'Who are they to you?',
      type: 'pills',
      options: [
        { value: 'boss', label: 'Boss/Manager' },
        { value: 'colleague', label: 'Colleague' },
        { value: 'mentor', label: 'Mentor' },
        { value: 'client', label: 'Client' },
        { value: 'employee', label: 'Employee' },
      ],
    },
    {
      key: 'professionalContext',
      question: "What's the context?",
      type: 'text',
      placeholder: 'e.g., Leaving the company, promotion, project completed',
    },
    {
      key: 'professionalWhatTheyDid',
      question: 'What did they do that matters?',
      type: 'text',
      placeholder: 'e.g., Mentored me, helped land a big deal',
    },
    {
      key: 'professionalToneCheck',
      question: 'How formal should this be?',
      type: 'pills',
      options: [
        { value: 'formal', label: 'Keep it professional' },
        { value: 'warm', label: 'Warm but appropriate' },
        { value: 'casual', label: 'We joke around' },
      ],
    },
  ],
  dating: [
    {
      key: 'datingHowLong',
      question: 'How long have you been seeing each other?',
      type: 'pills',
      options: [
        { value: 'justMet', label: 'Just met' },
        { value: 'fewDates', label: 'A few dates' },
        { value: 'coupleMonths', label: 'Couple months' },
        { value: 'gettingSerious', label: 'Getting serious' },
      ],
    },
    {
      key: 'datingHowMet',
      question: 'How did you meet?',
      type: 'text',
      placeholder: 'e.g., Dating app, through friends, coffee shop',
    },
    {
      key: 'datingWhatYouLike',
      question: 'What do you like most about them?',
      type: 'text',
      placeholder: "e.g., Their laugh, how they listen, they're so weird",
    },
    {
      key: 'datingCardIntensity',
      question: 'How intense should the card be?',
      type: 'pills',
      options: [
        { value: 'light', label: 'Keep it light' },
        { value: 'flirty', label: 'Flirty' },
        { value: 'earnest', label: 'Earnest' },
      ],
    },
  ],
  grandparent: [
    {
      key: 'grandparentWhich',
      question: 'Which grandparent?',
      type: 'pills',
      options: [
        { value: 'grandma', label: 'Grandma' },
        { value: 'grandpa', label: 'Grandpa' },
        { value: 'greatGrandparent', label: 'Great-grandparent' },
      ],
    },
    {
      key: 'grandparentRelationship',
      question: "What's your relationship like?",
      type: 'pills',
      options: [
        { value: 'veryClose', label: 'Very close' },
        { value: 'loving', label: 'Loving' },
        { value: 'reconnecting', label: 'Reconnecting' },
        { value: 'memorial', label: 'Honoring their memory' },
      ],
    },
    {
      key: 'grandparentMemory',
      question: 'A memory with them?',
      type: 'text',
      placeholder: 'e.g., Baking cookies together, their stories',
    },
    {
      key: 'grandparentTheyAlways',
      question: 'They always...',
      type: 'text',
      placeholder: 'e.g., slip you money, make the best pie',
    },
  ],
  other: [
    {
      key: 'otherDescribe',
      question: 'How would you describe this person?',
      type: 'text',
      placeholder: 'e.g., Neighbor, teacher, therapist, online friend',
    },
    {
      key: 'otherWhyCard',
      question: 'Why are you sending this card?',
      type: 'text',
      placeholder: 'e.g., They helped me through something, moving away',
    },
    {
      key: 'otherWhatToSay',
      question: 'What do you most want to say?',
      type: 'text',
      placeholder: 'The heart of your message',
    },
  ],
};

function PillButton({
  selected,
  onClick,
  children,
  emoji,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  emoji?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors',
        selected
          ? 'border-text-primary bg-text-primary text-panel-background'
          : 'border-theme-2 text-text-secondary hover:border-text-secondary',
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
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  description: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex flex-col gap-0.5 rounded-lg border p-3 text-left transition-colors',
        selected
          ? 'border-text-primary bg-text-primary/5'
          : 'border-theme-2 hover:border-text-secondary',
      )}
    >
      <span className="font-medium text-text-primary">{title}</span>
      <span className="text-xs text-text-muted">{description}</span>
    </button>
  );
}

export default function CardWizard({ card, onComplete, onBack }: Props) {
  const wizardStep = useCardStore((s) => s.wizardStep);
  const wizardAnswers = useCardStore((s) => s.wizardAnswers);
  const setWizardStep = useCardStore((s) => s.setWizardStep);
  const setWizardAnswer = useCardStore((s) => s.setWizardAnswer);
  const resetWizard = useCardStore((s) => s.resetWizard);

  const [variant, setVariant] = useState<CardVariant>('digital');
  const [generatedMessage, setGeneratedMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [added, setAdded] = useState(false);

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
    try {
      const response = await fetch('/api/generate', {
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

      if (response.ok) {
        const data = await response.json();
        setGeneratedMessage(data.message);
      }
    } catch {
      // Silently fail
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
        return Boolean(wizardAnswers.name?.trim());
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

  const renderStep = () => {
    switch (wizardStep) {
      case 'name':
        return (
          <div className="flex flex-col gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-text-primary">
                Who is this card for?
              </label>
              <input
                type="text"
                value={wizardAnswers.name || ''}
                onChange={(e) => setWizardAnswer('name', e.target.value)}
                placeholder="Enter their name"
                autoFocus
                className="w-full rounded-lg border border-theme-2 bg-transparent px-3 py-2 text-text-primary placeholder:text-text-muted focus:border-text-primary focus:outline-none"
              />
            </div>
          </div>
        );

      case 'relationship':
        return (
          <div className="flex flex-col gap-4">
            <label className="text-sm font-medium text-text-primary">
              What&apos;s your relationship with {wizardAnswers.name || 'them'}?
            </label>
            <div className="flex flex-wrap gap-2">
              {RELATIONSHIP_OPTIONS.map((opt) => (
                <PillButton
                  key={opt.value}
                  selected={wizardAnswers.relationshipType === opt.value}
                  onClick={() => setWizardAnswer('relationshipType', opt.value)}
                  emoji={opt.emoji}
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
            <label className="text-sm font-medium text-text-primary">
              What&apos;s the occasion?
            </label>
            <div className="flex flex-wrap gap-2">
              {OCCASION_OPTIONS.map((opt) => (
                <PillButton
                  key={opt.value}
                  selected={wizardAnswers.occasion === opt.value}
                  onClick={() => setWizardAnswer('occasion', opt.value)}
                  emoji={opt.emoji}
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
              <label className="text-sm font-medium text-text-primary">
                What vibe should this card have?
              </label>
              <p className="mt-1 text-xs text-text-muted">Select all that apply</p>
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
            <label className="text-sm font-medium text-text-primary">
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
                />
              ))}
            </div>
          </div>
        );

      case 'heartfeltDepth':
        return (
          <div className="flex flex-col gap-4">
            <label className="text-sm font-medium text-text-primary">
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
              <p className="text-sm text-text-muted">No additional questions for this relationship type.</p>
            </div>
          );
        }
        return (
          <div className="flex flex-col gap-5">
            <p className="text-xs text-text-muted">
              These details help create a more personal message
            </p>
            {questions.map((q) => (
              <div key={q.key} className="flex flex-col gap-2">
                <label className="text-sm font-medium text-text-primary">{q.question}</label>
                {q.type === 'text' && (
                  <input
                    type="text"
                    value={(wizardAnswers[q.key] as string) || ''}
                    onChange={(e) => setWizardAnswer(q.key as keyof WizardAnswers, e.target.value)}
                    placeholder={q.placeholder}
                    className="w-full rounded-lg border border-theme-2 bg-transparent px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-text-primary focus:outline-none"
                  />
                )}
                {q.type === 'pills' && q.options && (
                  <div className="flex flex-wrap gap-2">
                    {q.options.map((opt) => (
                      <PillButton
                        key={opt.value}
                        selected={wizardAnswers[q.key] === opt.value}
                        onClick={() => setWizardAnswer(q.key as keyof WizardAnswers, opt.value)}
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
              <label className="text-sm font-medium text-text-primary">
                Quick traits about {wizardAnswers.name || 'them'}
              </label>
              <p className="mt-1 text-xs text-text-muted">Select any that apply (optional)</p>
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
              <div className="rounded-lg border border-theme-2 bg-theme-3 p-4">
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-text-muted">
                  Your personalized message
                </p>
                <p className="text-sm leading-relaxed text-text-primary">{generatedMessage}</p>
                <p className="mt-3 text-right text-sm text-text-secondary">
                  — For {wizardAnswers.name}
                </p>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleGenerateMessage}
                disabled={isGenerating}
                className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-theme-2 p-4 text-sm text-text-secondary hover:border-text-secondary hover:text-text-primary"
              >
                <Sparkles className="size-4" />
                {isGenerating ? 'Generating your message...' : 'Generate personalized message'}
              </button>
            )}

            {/* Variant selection */}
            <div className="flex flex-col gap-2">
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-theme-2 p-3 transition-colors hover:border-text-secondary">
                <input
                  type="radio"
                  name="variant"
                  value="physical"
                  checked={variant === 'physical'}
                  onChange={() => setVariant('physical')}
                  className="size-4 accent-text-primary"
                />
                <div className="flex flex-1 items-center justify-between">
                  <div>
                    <div className="font-medium text-text-primary">Physical Card</div>
                    <div className="text-sm text-text-secondary">Printed & shipped</div>
                  </div>
                  <div className="font-medium text-text-primary">
                    ${(card.pricing.physical + 2).toFixed(2)}
                  </div>
                </div>
              </label>

              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-theme-2 p-3 transition-colors hover:border-text-secondary">
                <input
                  type="radio"
                  name="variant"
                  value="digital"
                  checked={variant === 'digital'}
                  onChange={() => setVariant('digital')}
                  className="size-4 accent-text-primary"
                />
                <div className="flex flex-1 items-center justify-between">
                  <div>
                    <div className="font-medium text-text-primary">Digital Download</div>
                    <div className="text-sm text-text-secondary">Instant delivery</div>
                  </div>
                  <div className="font-medium text-text-primary">
                    ${(card.pricing.digital + 2).toFixed(2)}
                  </div>
                </div>
              </label>

              <p className="text-center text-xs text-text-muted">
                Includes $2.00 personalization fee
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Progress bar */}
      <div className="flex items-center gap-3">
        <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-theme-2">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-text-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-xs tabular-nums text-text-muted">{progress}%</span>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-text-muted">
          {STEP_LABELS[wizardStep]}
        </span>
        <span className="text-xs text-text-muted">
          ({visibleStepIndex + 1}/{visibleSteps.length})
        </span>
      </div>

      {/* Step content */}
      <div className="min-h-[200px]">{renderStep()}</div>

      {/* Navigation */}
      <div className="flex gap-2 pt-2">
        <Button onClick={goBack} variant="text" className="flex items-center gap-1">
          <ArrowLeft className="size-4" />
          {visibleStepIndex === 0 ? 'Cancel' : 'Back'}
        </Button>
        {wizardStep === 'preview' ? (
          <Button onClick={handleAddToCart} variant="secondary" className="flex-1">
            {added ? (
              <span className="flex items-center gap-1">
                <Check className="size-4" /> Added!
              </span>
            ) : (
              'Add to Cart'
            )}
          </Button>
        ) : (
          <Button onClick={goNext} disabled={!canProceed} variant="secondary" className="flex-1">
            Continue
          </Button>
        )}
      </div>
    </div>
  );
}
