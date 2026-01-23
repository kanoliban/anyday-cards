/**
 * ADC Foundation Model — Version 1
 *
 * The first version of AnydayCard's prompt composition system.
 * Supports personality-aware text generation and basic image generation.
 */

// Core composition
export { composeTextPrompt, composeImagePrompt, ADC_VERSION } from './compose';

// Prompt builders
export { buildTextPrompt, getTextFallback } from './prompts/text';
export { buildImagePrompt, inferStyle } from './prompts/image';

// Components (for advanced usage)
export * from './components';
