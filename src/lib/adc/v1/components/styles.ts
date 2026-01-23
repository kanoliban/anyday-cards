/**
 * ADC v1 — Visual Style Definitions
 *
 * Base styles for image generation. Each style defines the visual language
 * that Gemini should use when generating card imagery.
 */

import type { CardStyle, Occasion } from '../../types';

/** Style definitions — visual language for each base style */
export const STYLE_DEFINITIONS: Record<CardStyle, string> = {
  'illustrated-warm': 'Illustrated greeting card with warm colors, soft watercolor textures, hand-drawn feel, cozy and inviting aesthetic',
  'modern-minimal': 'Modern minimalist greeting card, clean lines, generous white space, subtle geometric elements, sophisticated typography',
  'vintage-nostalgic': 'Vintage-inspired greeting card, retro color palette, distressed textures, nostalgic typography, classic charm',
  'bold-playful': 'Bold and playful greeting card, vibrant colors, dynamic shapes, fun patterns, energetic and joyful',
};

/** Occasion-specific visual cues */
export const OCCASION_VISUALS: Record<string, string> = {
  Birthday: 'birthday celebration theme with subtle festive elements',
  'Thank You': 'warm appreciation theme with graceful flourishes',
  Congratulations: 'celebratory achievement theme with triumphant elements',
  Holiday: 'seasonal holiday warmth with cozy winter elements',
  "Valentine's Day": 'romantic love theme with hearts and soft textures',
  Anniversary: 'timeless love celebration with elegant romantic elements',
  'Just Because': 'spontaneous warmth with cheerful everyday moments',
};

/** Default style when none specified */
export const DEFAULT_STYLE: CardStyle = 'illustrated-warm';

/**
 * Get the style definition for a given style
 */
export function getStyleDefinition(style?: CardStyle): string {
  return STYLE_DEFINITIONS[style || DEFAULT_STYLE];
}

/**
 * Get occasion-specific visual guidance
 */
export function getOccasionVisuals(occasion: string): string {
  return OCCASION_VISUALS[occasion] || OCCASION_VISUALS['Birthday'];
}

/**
 * Build the complete style guide for image generation
 */
export function buildStyleGuide(style?: CardStyle, occasion?: string): string {
  const styleDefinition = getStyleDefinition(style);
  const occasionVisuals = occasion ? getOccasionVisuals(occasion) : '';

  if (occasionVisuals) {
    return `${styleDefinition}, ${occasionVisuals}`;
  }

  return styleDefinition;
}
