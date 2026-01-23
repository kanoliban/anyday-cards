/**
 * ADC Foundation Model — Type Definitions
 *
 * Types for the AnydayCard prompt composition system.
 * @version 1.0.0
 */

export interface GenerationInput {
  // Required fields
  recipientName: string;
  relationship: string;
  occasion: string;

  // Optional personalization
  cardName?: string;
  cardTone?: string;
  vibes?: string[];
  humorType?: string;
  heartfeltDepth?: string;
  quickTraits?: string[];
  relationshipDetails?: Record<string, string>;

  // Legacy/couple mode
  details?: string;
  coupleMode?: boolean;
  senderName?: string;
  coupleStory?: string;
}

export interface TextGenerationOutput {
  prompt: string;
  version: string;
}

export interface ImageGenerationInput extends GenerationInput {
  // Generated message to display on card
  message: string;
  // Style overrides
  style?: CardStyle;
}

export interface ImageGenerationOutput {
  prompt: string;
  version: string;
}

export type Vibe = 'funny' | 'heartfelt' | 'spicy' | 'nostalgic' | 'inspiring';

export type HumorType = 'insideJokes' | 'dryWit' | 'overTheTop' | 'punny';

export type HeartfeltDepth = 'lightWarmth' | 'feelSeen' | 'deepConnection';

export type QuickTrait =
  | 'bookworm'
  | 'coffeeAddict'
  | 'dogPerson'
  | 'catPerson'
  | 'foodie'
  | 'adventurer'
  | 'homebody'
  | 'nightOwl'
  | 'earlyBird'
  | 'techie'
  | 'creative'
  | 'fitness';

export type CardStyle =
  | 'illustrated-warm'
  | 'modern-minimal'
  | 'vintage-nostalgic'
  | 'bold-playful';

export type Occasion =
  | 'Birthday'
  | 'Thank You'
  | 'Congratulations'
  | 'Holiday'
  | "Valentine's Day"
  | 'Anniversary'
  | 'Just Because';
