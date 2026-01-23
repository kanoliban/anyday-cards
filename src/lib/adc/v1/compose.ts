/**
 * ADC v1 — Composition Engine
 *
 * The core of the ADC Foundation Model. Combines prompt components
 * into coherent generation requests.
 *
 * This is where the "craft" lives — not just concatenation,
 * but understanding how components INTERACT.
 */

import type { GenerationInput, TextGenerationOutput } from '../types';
import { buildToneGuide, buildHumorGuide, buildDepthGuide } from './components/tones';
import { buildTraitsContext, buildRelationshipContext, buildDetailsContext } from './components/traits';
import { buildCoupleContext } from './components/occasions';

/** ADC Version identifier */
export const ADC_VERSION = '1.0.0';

/**
 * Compose a text generation prompt from wizard inputs
 *
 * This function orchestrates all the component builders to create
 * a coherent, personalized prompt for message generation.
 */
export function composeTextPrompt(input: GenerationInput): TextGenerationOutput {
  const {
    recipientName,
    relationship,
    occasion,
    cardTone,
    vibes,
    humorType,
    heartfeltDepth,
    quickTraits,
    relationshipDetails,
    details,
    coupleMode,
    senderName,
    coupleStory,
  } = input;

  // Build each component
  const vibeGuide = buildToneGuide(vibes, cardTone);
  const humorGuide = buildHumorGuide(humorType, vibes);
  const depthGuide = buildDepthGuide(heartfeltDepth, vibes);
  const traitsContext = buildTraitsContext(quickTraits);
  const relationshipContext = buildRelationshipContext(relationshipDetails);
  const detailsContext = buildDetailsContext(details);
  const coupleContext = buildCoupleContext(coupleMode, senderName, recipientName, coupleStory);

  // Compose the full prompt
  const prompt = `Write a short card message for ${recipientName} (my ${relationship.toLowerCase()}) for a ${occasion} card.

${vibeGuide}${humorGuide}${depthGuide}${traitsContext}${relationshipContext}${detailsContext}${coupleContext}

Requirements:
- 2-4 sentences maximum
- Personal and genuine — this should feel like it was written by someone who knows them
- Don't start with "Dear" (the card design handles the greeting)
- Don't sign off (no "Love," "Best," etc.)
- If personality traits are provided, reference them naturally (don't list them)
- If personal details are provided, weave them into the message
${coupleMode ? '- Use "we/us/our" language for this couple card' : ''}

Write just the message, nothing else.`;

  return {
    prompt,
    version: ADC_VERSION,
  };
}
