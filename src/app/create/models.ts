export type CardVariant = 'physical' | 'digital';

export type CardPricing = {
  physical: number;
  digital: number;
  currency: 'USD';
};

export type CardCollectionType = 'celebrations' | 'gratitude' | 'seasonal' | 'everyday';

export type Card = {
  id: string;
  name: string;
  occasion: string;
  style: 'illustrated' | 'typographic' | 'photographic' | 'minimal';
  tone: 'warm' | 'playful' | 'elegant' | 'minimal' | 'festive' | 'serene';
  colors: string[];
  size: string;
  paperStock: string;
  description: string;
  src: string;
  srcLg: string;
  srcBack?: string;
  srcLgBack?: string;
  width?: number;
  height?: number;
  pricing: CardPricing;
  inStock: boolean;
  collection?: CardCollectionType;
  aspect?: number;
};

export type CardCollection = {
  colors: {
    bg: string;
    fg: string;
    mutedBg: string;
    mutedFg: string;
  };
  cards: Card[];
};

// Wizard types
export type WizardStep =
  | 'name'
  | 'relationship'
  | 'occasion'
  | 'vibe'
  | 'humorType'
  | 'heartfeltDepth'
  | 'relationshipQuestions'
  | 'quickTraits'
  | 'preview';

export type RelationshipType =
  | 'partner'
  | 'friend'
  | 'parent'
  | 'child'
  | 'sibling'
  | 'professional'
  | 'dating'
  | 'grandparent'
  | 'other';

export type VibeType =
  | 'funny'
  | 'heartfelt'
  | 'spicy'
  | 'weird'
  | 'grateful'
  | 'nostalgic'
  | 'encouraging'
  | 'apologetic'
  | 'proud'
  | 'playful';

export type OccasionType =
  | 'birthday'
  | 'anniversary'
  | 'holiday'
  | 'support'
  | 'achievement'
  | 'miss'
  | 'justBecause'
  | 'apology'
  | 'thanks'
  | 'congratulations';

export type HumorType =
  | 'insideJokes'
  | 'playfulTeasing'
  | 'absurdist'
  | 'dryDeadpan'
  | 'selfDeprecating'
  | 'wholesomeSilly';

export type HeartfeltDepth = 'warmLight' | 'feelSeen' | 'mightCry';

export type QuickTrait =
  | 'dogPerson'
  | 'catPerson'
  | 'coffeeAddict'
  | 'teaDrinker'
  | 'gymRat'
  | 'hatesMornings'
  | 'alwaysLate'
  | 'plantParent'
  | 'gamer'
  | 'bookworm'
  | 'foodie'
  | 'homebody'
  | 'overthinker'
  | 'crierAtMovies'
  | 'neatFreak'
  | 'creativeMess'
  | 'workaholic'
  | 'adventureSeeker'
  | 'introvert'
  | 'lifeOfTheParty';

export interface WizardAnswers {
  name: string;
  relationshipType: RelationshipType;
  occasion: OccasionType;
  vibes: VibeType[];
  humorType?: HumorType;
  heartfeltDepth?: HeartfeltDepth;
  quickTraits: QuickTrait[];
  // Relationship-specific fields (dynamic)
  [key: string]: string | string[] | undefined;
}
