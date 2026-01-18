import type {
  HeartfeltDepth,
  HumorType,
  OccasionType,
  QuickTrait,
  RelationshipType,
  VibeType,
  WizardStep,
} from '../models';

export type QuestionType = 'text' | 'grid' | 'pills' | 'multiSelect' | 'chips' | 'list';

export interface QuestionOption<T = string> {
  value: T;
  label: string;
  emoji?: string;
  description?: string;
}

export interface QuestionConfig {
  id: string;
  step: WizardStep;
  type: QuestionType;
  title: string;
  subtitle?: string;
  placeholder?: string;
  required: boolean;
  maxSelect?: number;
  options?: QuestionOption[];
  showIf?: (answers: Record<string, unknown>) => boolean;
}

// Relationship options with emojis
export const relationshipOptions: QuestionOption<RelationshipType>[] = [
  { value: 'partner', label: 'Partner/Spouse', emoji: '💑' },
  { value: 'friend', label: 'A friend', emoji: '👯' },
  { value: 'parent', label: 'My parent', emoji: '👨‍👩‍👧' },
  { value: 'child', label: 'My child', emoji: '👶' },
  { value: 'sibling', label: 'Sibling', emoji: '👫' },
  { value: 'professional', label: 'Coworker/Professional', emoji: '💼' },
  { value: 'dating', label: "Someone I'm dating", emoji: '🌱' },
  { value: 'grandparent', label: 'Grandparent', emoji: '👴' },
  { value: 'other', label: 'Someone else', emoji: '✨' },
];

// Occasion options with emojis
export const occasionOptions: QuestionOption<OccasionType>[] = [
  { value: 'birthday', label: 'Their birthday', emoji: '🎂' },
  { value: 'anniversary', label: 'Our anniversary', emoji: '💑' },
  { value: 'holiday', label: 'A holiday', emoji: '🎄' },
  { value: 'support', label: "They're going through something", emoji: '🫂' },
  { value: 'achievement', label: 'They achieved something', emoji: '🏆' },
  { value: 'miss', label: 'I miss them', emoji: '💭' },
  { value: 'justBecause', label: 'No reason — just because', emoji: '💫' },
  { value: 'apology', label: 'I messed up', emoji: '😬' },
  { value: 'thanks', label: 'To say thank you', emoji: '🙏' },
  { value: 'congratulations', label: 'Congratulations', emoji: '🎉' },
];

// Vibe options with emojis
export const vibeOptions: QuestionOption<VibeType>[] = [
  { value: 'funny', label: 'Funny', emoji: '😄' },
  { value: 'heartfelt', label: 'Heartfelt', emoji: '💝' },
  { value: 'spicy', label: 'Spicy', emoji: '🌶️' },
  { value: 'weird', label: 'Weird', emoji: '🦑' },
  { value: 'grateful', label: 'Grateful', emoji: '🙏' },
  { value: 'nostalgic', label: 'Nostalgic', emoji: '📷' },
  { value: 'encouraging', label: 'Encouraging', emoji: '✨' },
  { value: 'apologetic', label: 'Apologetic', emoji: '🥺' },
  { value: 'proud', label: 'Proud', emoji: '🌟' },
  { value: 'playful', label: 'Playful', emoji: '🎈' },
];

// Humor type options
export const humorTypeOptions: QuestionOption<HumorType>[] = [
  { value: 'insideJokes', label: "Inside jokes only we'd get" },
  { value: 'playfulTeasing', label: 'Playful teasing/light roast' },
  { value: 'absurdist', label: 'Absurdist/weird humor' },
  { value: 'dryDeadpan', label: 'Dry/deadpan' },
  { value: 'selfDeprecating', label: 'Self-deprecating' },
  { value: 'wholesomeSilly', label: 'Wholesome/silly' },
];

// Heartfelt depth options
export const heartfeltDepthOptions: QuestionOption<HeartfeltDepth>[] = [
  { value: 'warmLight', label: 'Keep it warm but light' },
  { value: 'feelSeen', label: 'I want them to feel seen' },
  { value: 'mightCry', label: "I might cry writing this and that's okay" },
];

// Quick traits options
export const quickTraitOptions: QuestionOption<QuickTrait>[] = [
  { value: 'dogPerson', label: 'Dog person', emoji: '🐕' },
  { value: 'catPerson', label: 'Cat person', emoji: '🐈' },
  { value: 'coffeeAddict', label: 'Coffee addict', emoji: '☕' },
  { value: 'teaDrinker', label: 'Tea drinker', emoji: '🍵' },
  { value: 'gymRat', label: 'Gym rat', emoji: '💪' },
  { value: 'hatesMornings', label: 'Hates mornings', emoji: '😴' },
  { value: 'alwaysLate', label: 'Always late', emoji: '⏰' },
  { value: 'plantParent', label: 'Plant parent', emoji: '🪴' },
  { value: 'gamer', label: 'Gamer', emoji: '🎮' },
  { value: 'bookworm', label: 'Bookworm', emoji: '📚' },
  { value: 'foodie', label: 'Foodie', emoji: '🍜' },
  { value: 'homebody', label: 'Homebody', emoji: '🏠' },
  { value: 'overthinker', label: 'Overthinker', emoji: '🤔' },
  { value: 'crierAtMovies', label: 'Crier at movies', emoji: '🎬' },
  { value: 'neatFreak', label: 'Neat freak', emoji: '✨' },
  { value: 'creativeMess', label: 'Creative mess', emoji: '🎨' },
  { value: 'workaholic', label: 'Workaholic', emoji: '💼' },
  { value: 'adventureSeeker', label: 'Adventure seeker', emoji: '🏔️' },
  { value: 'introvert', label: 'Introvert', emoji: '🌙' },
  { value: 'lifeOfTheParty', label: 'Life of the party', emoji: '🎉' },
];

// Question configurations
export const questions: QuestionConfig[] = [
  {
    id: 'name',
    step: 'name',
    type: 'text',
    title: "Who's this card for?",
    placeholder: 'Their name',
    required: true,
  },
  {
    id: 'relationshipType',
    step: 'relationship',
    type: 'grid',
    title: 'Who are they to you?',
    required: true,
    options: relationshipOptions,
  },
  {
    id: 'occasion',
    step: 'occasion',
    type: 'grid',
    title: "What's the occasion?",
    required: true,
    options: occasionOptions,
  },
  {
    id: 'vibes',
    step: 'vibe',
    type: 'multiSelect',
    title: 'What vibe are you going for?',
    subtitle: 'Pick up to 2',
    required: true,
    maxSelect: 2,
    options: vibeOptions,
  },
  {
    id: 'humorType',
    step: 'humorType',
    type: 'list',
    title: 'What kind of funny?',
    required: false,
    options: humorTypeOptions,
    showIf: (answers) => {
      const vibes = answers.vibes as string[] | undefined;
      return vibes?.includes('funny') ?? false;
    },
  },
  {
    id: 'heartfeltDepth',
    step: 'heartfeltDepth',
    type: 'list',
    title: 'How deep should we go?',
    required: false,
    options: heartfeltDepthOptions,
    showIf: (answers) => {
      const vibes = answers.vibes as string[] | undefined;
      return (vibes?.includes('heartfelt') && !vibes?.includes('funny')) ?? false;
    },
  },
  {
    id: 'quickTraits',
    step: 'quickTraits',
    type: 'chips',
    title: 'Any quick traits that describe them?',
    subtitle: 'Optional — helps personalize the message',
    required: false,
    options: quickTraitOptions,
  },
];

// Step order for navigation
export const stepOrder: WizardStep[] = [
  'name',
  'relationship',
  'occasion',
  'vibe',
  'humorType',
  'heartfeltDepth',
  'quickTraits',
  'preview',
];

// Get next step considering conditional logic
export function getNextStep(
  currentStep: WizardStep,
  answers: Record<string, unknown>
): WizardStep | null {
  const currentIndex = stepOrder.indexOf(currentStep);
  if (currentIndex === -1 || currentIndex === stepOrder.length - 1) return null;

  for (let i = currentIndex + 1; i < stepOrder.length; i++) {
    const nextStep = stepOrder[i];
    const question = questions.find((q) => q.step === nextStep);

    // If no question for this step or showIf passes, use this step
    if (!question?.showIf || question.showIf(answers)) {
      return nextStep;
    }
  }

  return 'preview';
}

// Get previous step considering conditional logic
export function getPrevStep(
  currentStep: WizardStep,
  answers: Record<string, unknown>
): WizardStep | null {
  const currentIndex = stepOrder.indexOf(currentStep);
  if (currentIndex <= 0) return null;

  for (let i = currentIndex - 1; i >= 0; i--) {
    const prevStep = stepOrder[i];
    const question = questions.find((q) => q.step === prevStep);

    // If no question for this step or showIf passes, use this step
    if (!question?.showIf || question.showIf(answers)) {
      return prevStep;
    }
  }

  return null;
}

// Calculate progress percentage
export function calculateProgress(
  currentStep: WizardStep,
  answers: Record<string, unknown>
): number {
  const activeSteps = stepOrder.filter((step) => {
    const question = questions.find((q) => q.step === step);
    return !question?.showIf || question.showIf(answers);
  });

  const currentIndex = activeSteps.indexOf(currentStep);
  if (currentIndex === -1) return 0;

  return Math.round(((currentIndex + 1) / activeSteps.length) * 100);
}
