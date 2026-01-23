import { NextResponse } from 'next/server';
import { z } from 'zod';

const eventSchema = z.object({
  event: z.string().min(1).max(100),
  cohort: z.enum(['v1', 'v2']),
  version: z.string().optional(),
  occasion: z.string().optional(),
  relationship: z.string().optional(),
  vibes: z.array(z.string()).optional(),
  cardType: z.enum(['digital', 'physical']).optional(),
  regenerationCount: z.number().optional(),
  step: z.string().optional(),
  timestamp: z.number(),
});

/**
 * ADC Analytics Events API
 *
 * Receives A/B testing events from the client with cohort tagging.
 * Events are logged for analysis of v1 vs v2 prompt strategies.
 */
export async function POST(req: Request): Promise<Response> {
  try {
    const body = await req.json();
    const parsed = eventSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid event data', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const eventData = parsed.data;

    // Log to server for analytics
    console.log('[Analytics Event]', {
      event: eventData.event,
      cohort: eventData.cohort,
      version: eventData.version,
      timestamp: new Date(eventData.timestamp).toISOString(),
      metadata: {
        occasion: eventData.occasion,
        relationship: eventData.relationship,
        vibes: eventData.vibes,
        cardType: eventData.cardType,
        regenerationCount: eventData.regenerationCount,
        step: eventData.step,
      },
    });

    // TODO: Store events in database for long-term analysis
    // await supabase.from('adc_analytics_events').insert(eventData);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Analytics] Event logging error:', error);
    return NextResponse.json({ error: 'Failed to log event' }, { status: 500 });
  }
}
