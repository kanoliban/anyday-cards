/**
 * ADC Foundation Model — Version 2
 *
 * Composition-aware system prompt approach.
 *
 * Key difference from v1:
 * - v1: Hand-coded composition rules via concatenation
 * - v2: Rich "artist" system prompt teaches Gemini the craft
 *
 * Same latency (~1s), same Gemini model, but smarter prompt engineering.
 */

// Prompt builders
export {
  buildTextPromptV2,
  getTextFallbackV2,
  SYSTEM_PROMPT_V2,
  ADC_VERSION_V2,
} from './prompts/text';

// Re-export types
export type { TextPromptV2Result } from './prompts/text';

// Version constant for this module
export const ADC_VERSION = '2.0.0';
