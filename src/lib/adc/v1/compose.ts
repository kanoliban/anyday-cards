/**
 * ADC v1 — Composition Engine
 *
 * The core of the ADC Foundation Model. Combines prompt components
 * into coherent generation requests.
 *
 * This is where the "craft" lives — not just concatenation,
 * but understanding how components INTERACT.
 */

import type { GenerationInput, TextGenerationOutput, ImageGenerationInput, ImageGenerationOutput } from '../types';
import { buildToneGuide, buildHumorGuide, buildDepthGuide } from './components/tones';
import { buildTraitsContext, buildRelationshipContext, buildDetailsContext } from './components/traits';
import { buildCoupleContext } from './components/occasions';
import { buildStyleGuide } from './components/styles';

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

/**
 * Compose an image generation prompt from wizard inputs + generated message
 *
 * Takes the text generation output and creates a visual prompt
 * with the message baked in.
 */
export function composeImagePrompt(input: ImageGenerationInput): ImageGenerationOutput {
  const {
    recipientName,
    occasion,
    style,
    message,
    vibes,
  } = input;

  // Build style guide from style + occasion
  const styleGuide = buildStyleGuide(style, occasion);

  // Determine visual mood from vibes
  const visualMood = getVisualMood(vibes);

  // Compose the image prompt
  const prompt = `Create a beautiful greeting card design:

STYLE: ${styleGuide}
${visualMood ? `MOOD: ${visualMood}` : ''}

The card displays this heartfelt message:
"${message}"

REQUIREMENTS:
- The text "${message}" must be clearly legible and centered on the card
- Card dimensions: standard greeting card ratio (5x7 inches)
- Text should be the focal point, surrounded by complementary design elements
- High quality, print-ready resolution
- Professional typography that matches the ${style || 'illustrated-warm'} style
- For: ${recipientName}, ${occasion}

Generate a complete, ready-to-print greeting card design.`;

  return {
    prompt,
    version: ADC_VERSION,
  };
}

/**
 * Map vibes to visual mood descriptors for image generation
 */
function getVisualMood(vibes?: string[]): string {
  if (!vibes?.length) {
    return '';
  }

  const moodMap: Record<string, string> = {
    funny: 'lighthearted and whimsical visual elements',
    heartfelt: 'warm and tender visual atmosphere',
    spicy: 'bold and romantic visual energy',
    nostalgic: 'soft, dreamy vintage visual quality',
    inspiring: 'uplifting and bright visual optimism',
  };

  const moods = vibes
    .map((v) => moodMap[v])
    .filter(Boolean);

  return moods.join(', ');
}
