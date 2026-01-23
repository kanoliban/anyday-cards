/**
 * ADC Foundation Model — Version 1
 *
 * The first version of AnydayCard's prompt composition system.
 * Supports personality-aware text generation via concatenation approach.
 */

// Core composition
export { composeTextPrompt, ADC_VERSION } from './compose';

// Prompt builders
export { buildTextPrompt, getTextFallback } from './prompts/text';

// Components (for advanced usage)
export * from './components';
