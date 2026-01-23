/**
 * ADC v1 — Tone Modifiers
 *
 * Maps vibe selections to natural language guidance for the prompt.
 */

import type { Vibe, HumorType, HeartfeltDepth } from '../../types';

/** Core vibe descriptions — how each vibe translates to tone guidance */
export const VIBE_DESCRIPTIONS: Record<Vibe, string> = {
  funny: 'humorous and playful',
  heartfelt: 'warm and emotionally sincere',
  spicy: 'flirty and bold',
  nostalgic: 'reflective and memory-filled',
  inspiring: 'inspiring and uplifting',
};

/** Humor sub-types — more specific guidance when funny vibe is selected */
export const HUMOR_DESCRIPTIONS: Record<HumorType, string> = {
  insideJokes: 'reference shared experiences or inside jokes',
  dryWit: 'use clever, understated humor',
  overTheTop: 'be dramatically exaggerated and silly',
  punny: 'include a witty pun or wordplay',
};

/** Heartfelt depth — emotional intensity levels */
export const DEPTH_DESCRIPTIONS: Record<HeartfeltDepth, string> = {
  lightWarmth: 'keep it light and cheerful',
  feelSeen: 'make them feel truly seen and appreciated',
  deepConnection: 'express deep emotional connection and gratitude',
};

/**
 * Build tone guidance from vibes and optional modifiers
 */
export function buildToneGuide(
  vibes?: string[],
  cardTone?: string,
): string {
  if (vibes?.length) {
    const descriptions = vibes
      .map((v) => VIBE_DESCRIPTIONS[v as Vibe] || v)
      .join(' and ');
    return `The tone should be ${descriptions}.`;
  }

  if (cardTone) {
    return `The tone should be ${cardTone}.`;
  }

  // Default fallback
  return 'The tone should be warm and heartfelt.';
}

/**
 * Build humor-specific guidance (only applies when funny vibe is selected)
 */
export function buildHumorGuide(
  humorType?: string,
  vibes?: string[],
): string {
  if (!humorType || !vibes?.includes('funny')) {
    return '';
  }
  const description = HUMOR_DESCRIPTIONS[humorType as HumorType] || humorType;
  return `\nHumor style: ${description}.`;
}

/**
 * Build heartfelt depth guidance (only applies when heartfelt vibe is selected)
 */
export function buildDepthGuide(
  heartfeltDepth?: string,
  vibes?: string[],
): string {
  if (!heartfeltDepth || !vibes?.includes('heartfelt')) {
    return '';
  }
  const description = DEPTH_DESCRIPTIONS[heartfeltDepth as HeartfeltDepth] || heartfeltDepth;
  return `\nEmotional depth: ${description}.`;
}
