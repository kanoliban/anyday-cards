/**
 * ADC Foundation Model
 *
 * AnydayCard's prompt composition system for AI-powered card generation.
 *
 * The ADC Foundation Model is NOT just a library of prompts. It's:
 * 1. Codified tacit knowledge — intuitions made explicit and reproducible
 * 2. A composition engine — rules for how components INTERACT
 * 3. Accumulated learning — improved through user feedback
 * 4. Quality floor guarantee — any combination meets brand standards
 *
 * Versions:
 * - v1: Hand-coded composition rules via concatenation
 * - v2: Composition-aware system prompt (teaches Gemini the craft)
 */

// Export current version (v1) as default
export * from './v1';

// Export v2 as namespaced module for A/B testing
export * as v2 from './v2';

// Export types
export * from './types';

// Version information
export const CURRENT_VERSION = '1.0.0';
export const LATEST_VERSION = '2.0.0';
export const VERSION_HISTORY = ['1.0.0', '2.0.0'] as const;
