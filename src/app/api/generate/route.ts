import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const generateSchema = z.object({
  recipientName: z.string().min(1).max(100),
  relationship: z.string().min(1).max(50),
  occasion: z.string().min(1).max(100),
  cardName: z.string().optional(),
  cardTone: z.string().optional(),
  details: z.string().max(500).optional(),
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

    const { recipientName, relationship, occasion, cardTone, details } = parsed.data;

    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
    if (!apiKey) {
      // Fallback to a template message if no API key
      const fallbackMessage = generateFallbackMessage(recipientName, relationship, occasion);
      return NextResponse.json({ message: fallbackMessage });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const toneGuide = cardTone
      ? `The tone should be ${cardTone} (e.g., warm and heartfelt, playful and fun, elegant and sincere).`
      : 'The tone should be warm and heartfelt.';

    const detailsContext = details
      ? `\n\nPersonal context to incorporate: ${details}`
      : '';

    const prompt = `Write a short, heartfelt card message for ${recipientName} (my ${relationship.toLowerCase()}) for a ${occasion} card. ${toneGuide}${detailsContext}

Requirements:
- 2-4 sentences maximum
- Personal and genuine
- Don't start with "Dear" (the card design handles the greeting)
- Don't sign off (no "Love," "Best," etc.)
- Focus on the sentiment, not generic phrases
- If personal context is provided, weave it naturally into the message

Write just the message, nothing else.`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const generatedText = response.text().trim();

    if (!generatedText) {
      return NextResponse.json({
        message: generateFallbackMessage(recipientName, relationship, occasion),
      });
    }

    return NextResponse.json({ message: generatedText });
  } catch (error) {
    console.error('Generate message error:', error);

    // Return fallback on any error
    const fallbackMessage =
      "Wishing you all the happiness and joy that this special day brings. You mean so much to me, and I'm grateful to celebrate with you.";
    return NextResponse.json({ message: fallbackMessage });
  }
}

function generateFallbackMessage(
  recipientName: string,
  relationship: string,
  occasion: string,
): string {
  const templates: Record<string, string[]> = {
    Birthday: [
      `${recipientName}, another year of amazing memories with you! Here's to celebrating everything that makes you special.`,
      `Happy birthday to the most wonderful ${relationship.toLowerCase()}! May this year bring you all the joy you deserve.`,
    ],
    'Thank You': [
      `${recipientName}, your kindness means more than words can say. Thank you for being such an incredible ${relationship.toLowerCase()}.`,
      `Grateful doesn't even begin to cover it. Thank you for everything you do.`,
    ],
    Congratulations: [
      `${recipientName}, this achievement is so well-deserved! I'm incredibly proud of everything you've accomplished.`,
      `What an incredible milestone! You've worked so hard for this, and it shows.`,
    ],
    Holiday: [
      `${recipientName}, wishing you warmth, joy, and all the magic this season has to offer.`,
      `May this holiday season bring you peace, happiness, and time with those you love.`,
    ],
  };

  const occasionTemplates = templates[occasion] || templates['Birthday'];
  const randomTemplate = occasionTemplates[Math.floor(Math.random() * occasionTemplates.length)];

  return randomTemplate;
}
