import { NextResponse } from 'next/server';
import { z } from 'zod';

import { buildImagePrompt, inferStyle, ADC_VERSION } from '~/src/lib/adc';
import type { ImageGenerationInput, CardStyle } from '~/src/lib/adc';

const generateImageSchema = z.object({
  // Required fields
  recipientName: z.string().min(1).max(100),
  relationship: z.string().min(1).max(50),
  occasion: z.string().min(1).max(100),
  message: z.string().min(1).max(1000),
  // Style options
  style: z.enum(['illustrated-warm', 'modern-minimal', 'vintage-nostalgic', 'bold-playful']).optional(),
  // Card metadata
  cardTone: z.string().optional(),
  vibes: z.array(z.string()).optional(),
});

/**
 * POST /api/generate-image
 *
 * Composes an image generation prompt using the ADC Foundation Model.
 *
 * For v1.0, this returns the composed prompt that can be sent to an image
 * generation service (Gemini Imagen, Replicate, etc). Future versions may
 * integrate directly with image APIs.
 *
 * Request body:
 * - recipientName: string (required)
 * - relationship: string (required)
 * - occasion: string (required)
 * - message: string (required) - the generated card message
 * - style: CardStyle (optional) - inferred from cardTone/vibes if not provided
 * - cardTone: string (optional)
 * - vibes: string[] (optional)
 *
 * Response:
 * - prompt: string - the composed image generation prompt
 * - version: string - ADC version used
 * - style: CardStyle - the style (provided or inferred)
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = generateImageSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const data = parsed.data;

    // Log image prompt request with ADC version
    console.log('[ADC:image]', {
      version: ADC_VERSION,
      occasion: data.occasion,
      style: data.style ?? 'inferred',
      vibes: data.vibes,
    });

    // Infer style if not provided
    const style: CardStyle = data.style ?? inferStyle(data.cardTone, data.vibes);

    const input: ImageGenerationInput = {
      ...data,
      style,
    };

    // Use ADC Foundation Model to compose the image prompt
    const { prompt, version } = buildImagePrompt(input);

    return NextResponse.json({
      prompt,
      version,
      style,
    });
  } catch (error) {
    console.error('Generate image prompt error:', error);

    return NextResponse.json(
      {
        error: 'Failed to compose image prompt',
        version: ADC_VERSION,
      },
      { status: 500 },
    );
  }
}
