import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { v2 } from '~/src/lib/adc';
import type { GenerationInput } from '~/src/lib/adc';

const { buildTextPromptV2, getTextFallbackV2, ADC_VERSION_V2 } = v2;

const generateSchema = z.object({
  // Required fields
  recipientName: z.string().min(1).max(100),
  relationship: z.string().min(1).max(50),
  occasion: z.string().min(1).max(100),
  // Card metadata
  cardName: z.string().optional(),
  cardTone: z.string().optional(),
  // Wizard personalization fields
  vibes: z.array(z.string()).optional(),
  humorType: z.string().optional(),
  heartfeltDepth: z.string().optional(),
  quickTraits: z.array(z.string()).optional(),
  relationshipDetails: z.record(z.string(), z.string()).optional(),
  // Legacy/additional fields
  details: z.string().max(500).optional(),
  coupleMode: z.boolean().optional(),
  senderName: z.string().max(100).optional(),
  coupleStory: z.string().max(500).optional(),
});

/**
 * ADC v2.0 Text Generation API
 *
 * Uses composition-aware system prompt approach.
 * Identical input/output contract to /api/generate (v1) for A/B testing.
 *
 * Key difference:
 * - v1: Single concatenated prompt
 * - v2: System prompt (composition rules) + User message (data)
 */
export async function POST(req: Request): Promise<Response> {
  try {
    const body = await req.json();
    const parsed = generateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const input: GenerationInput = parsed.data;

    // Log generation request with ADC version for analytics
    console.log('[ADC v2]', {
      version: ADC_VERSION_V2,
      occasion: input.occasion,
      relationship: input.relationship,
      vibes: input.vibes,
      hasTraits: !!input.quickTraits?.length,
      hasRelationshipDetails: !!input.relationshipDetails && Object.keys(input.relationshipDetails).length > 0,
    });

    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
    if (!apiKey) {
      // Return fallback when no API key
      const fallback = getTextFallbackV2(input);
      return NextResponse.json({
        message: fallback.message,
        version: fallback.version,
        isFallback: true,
      });
    }

    // Use ADC v2 to build system prompt + user message
    const { systemPrompt, userMessage, version } = buildTextPromptV2(input);

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: systemPrompt,
    });

    const result = await model.generateContent(userMessage);
    const response = result.response;
    const generatedText = response.text().trim();

    if (!generatedText) {
      const fallback = getTextFallbackV2(input);
      return NextResponse.json({
        message: fallback.message,
        version: fallback.version,
        isFallback: true,
      });
    }

    return NextResponse.json({
      message: generatedText,
      version,
    });
  } catch (error) {
    console.error('[ADC v2] Generate message error:', error);

    // Return generic fallback on any error
    return NextResponse.json({
      message: "Wishing you all the happiness and joy that this special day brings. You mean so much to me, and I'm grateful to celebrate with you.",
      version: ADC_VERSION_V2,
      isFallback: true,
    });
  }
}
