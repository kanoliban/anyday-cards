/**
 * ADC v1 — Personality Trait Injectors
 *
 * Maps quick traits to natural language descriptions for personalization.
 */

import type { QuickTrait } from '../../types';

/** Trait descriptions — human-readable personality markers */
export const TRAIT_DESCRIPTIONS: Record<QuickTrait, string> = {
  bookworm: 'loves reading',
  coffeeAddict: 'runs on coffee',
  dogPerson: 'adores dogs',
  catPerson: 'loves cats',
  foodie: 'passionate about food',
  adventurer: 'loves adventure and travel',
  homebody: 'enjoys cozy time at home',
  nightOwl: 'comes alive at night',
  earlyBird: 'rises with the sun',
  techie: 'loves technology',
  creative: 'has an artistic soul',
  fitness: 'dedicated to fitness',
};

/**
 * Build personality context from quick traits
 */
export function buildTraitsContext(quickTraits?: string[]): string {
  if (!quickTraits?.length) {
    return '';
  }

  const descriptions = quickTraits
    .map((t) => TRAIT_DESCRIPTIONS[t as QuickTrait] || t)
    .join(', ');

  return `\nAbout them: ${descriptions}.`;
}

/**
 * Build relationship details context from dynamic Q&A answers
 */
export function buildRelationshipContext(
  relationshipDetails?: Record<string, string>,
): string {
  if (!relationshipDetails || Object.keys(relationshipDetails).length === 0) {
    return '';
  }

  const values = Object.values(relationshipDetails).filter(Boolean);
  if (values.length === 0) {
    return '';
  }

  return `\nPersonal details: ${values.join('. ')}.`;
}

/**
 * Build legacy details context (for backward compatibility)
 */
export function buildDetailsContext(details?: string): string {
  if (!details) {
    return '';
  }
  return `\nAdditional context: ${details}`;
}
