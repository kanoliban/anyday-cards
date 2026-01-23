import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { buildTextPrompt, getTextFallback, ADC_VERSION } from '~/src/lib/adc';
import type { GenerationInput } from '~/src/lib/adc';

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

export async function POST(req: Request) {
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

    // Log generation request with ADC version for analytics/debugging
    console.log('[ADC]', {
      version: ADC_VERSION,
      occasion: input.occasion,
      relationship: input.relationship,
      vibes: input.vibes,
      hasTraits: !!input.quickTraits?.length,
    });

    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
    if (!apiKey) {
      // Return fallback when no API key
      const fallback = getTextFallback(input);
      return NextResponse.json({
        message: fallback.message,
        version: fallback.version,
        isFallback: true,
      });
    }

    // Use ADC Foundation Model to compose the prompt
    const { prompt, version } = buildTextPrompt(input);

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const result = await model.generateContent(prompt);
    const response = result.response;
    const generatedText = response.text().trim();

    if (!generatedText) {
      const fallback = getTextFallback(input);
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
    console.error('Generate message error:', error);

    // Return generic fallback on any error
    return NextResponse.json({
      message: "Wishing you all the happiness and joy that this special day brings. You mean so much to me, and I'm grateful to celebrate with you.",
      version: ADC_VERSION,
      isFallback: true,
    });
  }
}
