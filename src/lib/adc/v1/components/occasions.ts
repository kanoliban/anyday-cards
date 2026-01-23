/**
 * ADC v1 — Occasion Templates
 *
 * Occasion-specific context and requirements for card generation.
 */

import type { Occasion } from '../../types';

/** Fallback message templates by occasion */
export const FALLBACK_TEMPLATES: Record<string, string[]> = {
  Birthday: [
    '{name}, another year of amazing memories with you! Here\'s to celebrating everything that makes you special.',
    'Happy birthday to the most wonderful {relationship}! May this year bring you all the joy you deserve.',
  ],
  'Thank You': [
    '{name}, your kindness means more than words can say. Thank you for being such an incredible {relationship}.',
    'Grateful doesn\'t even begin to cover it. Thank you for everything you do.',
  ],
  Congratulations: [
    '{name}, this achievement is so well-deserved! I\'m incredibly proud of everything you\'ve accomplished.',
    'What an incredible milestone! You\'ve worked so hard for this, and it shows.',
  ],
  Holiday: [
    '{name}, wishing you warmth, joy, and all the magic this season has to offer.',
    'May this holiday season bring you peace, happiness, and time with those you love.',
  ],
  "Valentine's Day": [
    '{name}, you make my heart skip a beat in the best possible way. Happy Valentine\'s Day to someone truly special.',
    'Every day with you feels like a gift. Wishing my amazing {relationship} the happiest Valentine\'s Day.',
  ],
  Anniversary: [
    '{name}, every moment with you has been a gift. Here\'s to many more years together.',
    'Celebrating another year of adventures with you. You make every day brighter.',
  ],
  'Just Because': [
    '{name}, just wanted you to know how much you mean to me. No special occasion needed.',
    'Thinking of you today and feeling grateful to have you in my life.',
  ],
};

/** Couple mode fallback templates */
export const COUPLE_FALLBACK_TEMPLATES: string[] = [
  '{name}, every moment with you is a gift I never knew I needed. Here\'s to us and all the adventures still to come.',
  'Being with you has made me believe in love stories. Ours is my favorite.',
  '{name}, you make ordinary days feel extraordinary. I\'m so grateful we found each other.',
  'Every love story is beautiful, but ours is my favorite. Happy Valentine\'s Day to my favorite person.',
];

/**
 * Build couple mode context for Valentine's cards
 */
export function buildCoupleContext(
  coupleMode?: boolean,
  senderName?: string,
  recipientName?: string,
  coupleStory?: string,
): string {
  if (!coupleMode || !senderName) {
    return '';
  }

  let context = `\n\nIMPORTANT: This is a Valentine's card FROM ${senderName} TO ${recipientName}, celebrating their relationship as a couple.`;

  if (coupleStory) {
    context += ` Their story: "${coupleStory}"`;
  }

  context += '\nUse "we/us/our" language where natural.';

  return context;
}

/**
 * Get a fallback message for an occasion
 */
export function getFallbackMessage(
  recipientName: string,
  relationship: string,
  occasion: string,
  coupleMode?: boolean,
  senderName?: string,
): string {
  // Couple mode templates for Valentine's
  if (coupleMode && senderName) {
    const template = COUPLE_FALLBACK_TEMPLATES[
      Math.floor(Math.random() * COUPLE_FALLBACK_TEMPLATES.length)
    ];
    return template.replace('{name}', recipientName);
  }

  // Standard occasion templates
  const templates = FALLBACK_TEMPLATES[occasion] || FALLBACK_TEMPLATES['Birthday'];
  const template = templates[Math.floor(Math.random() * templates.length)];

  return template
    .replace('{name}', recipientName)
    .replace('{relationship}', relationship.toLowerCase());
}
