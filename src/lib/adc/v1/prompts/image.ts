/**
 * ADC v1 — Image Generation Prompts
 *
 * High-level API for card image generation using the ADC composition engine.
 */

import type { ImageGenerationInput, CardStyle } from '../../types';
import { composeImagePrompt, ADC_VERSION } from '../compose';

export { ADC_VERSION };

export interface ImageGenerationResult {
  prompt: string;
  version: string;
}

/**
 * Build an image generation prompt from user inputs + generated message
 *
 * Returns the composed prompt ready to send to Gemini's image generation model.
 */
export function buildImagePrompt(input: ImageGenerationInput): ImageGenerationResult {
  return composeImagePrompt(input);
}

/**
 * Infer a style from card tone/vibes when not explicitly set
 */
export function inferStyle(cardTone?: string, vibes?: string[]): CardStyle {
  // Check vibes first
  if (vibes?.includes('spicy') || vibes?.includes('funny')) {
    return 'bold-playful';
  }
  if (vibes?.includes('nostalgic')) {
    return 'vintage-nostalgic';
  }

  // Check card tone
  if (cardTone === 'elegant' || cardTone === 'sincere') {
    return 'modern-minimal';
  }
  if (cardTone === 'playful') {
    return 'bold-playful';
  }

  // Default
  return 'illustrated-warm';
}
