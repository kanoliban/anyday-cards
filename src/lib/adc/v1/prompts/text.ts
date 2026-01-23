/**
 * ADC v1 — Text Generation Prompts
 *
 * High-level API for text message generation using the ADC composition engine.
 */

import type { GenerationInput } from '../../types';
import { composeTextPrompt, ADC_VERSION } from '../compose';
import { getFallbackMessage } from '../components/occasions';

export { ADC_VERSION };

export interface TextGenerationResult {
  prompt: string;
  version: string;
}

export interface FallbackResult {
  message: string;
  version: string;
  isFallback: true;
}

/**
 * Build a text generation prompt from user inputs
 *
 * Returns the composed prompt ready to send to Gemini.
 */
export function buildTextPrompt(input: GenerationInput): TextGenerationResult {
  return composeTextPrompt(input);
}

/**
 * Get a fallback message when AI generation fails
 *
 * Uses pre-defined templates that still feel personal.
 */
export function getTextFallback(input: GenerationInput): FallbackResult {
  const message = getFallbackMessage(
    input.recipientName,
    input.relationship,
    input.occasion,
    input.coupleMode,
    input.senderName,
  );

  return {
    message,
    version: ADC_VERSION,
    isFallback: true,
  };
}
