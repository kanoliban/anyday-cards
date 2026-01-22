import { NextResponse } from 'next/server';
import { z } from 'zod';

import { cards } from '~/src/app/create/constants';
import type { CardVariant } from '~/src/app/create/models';
import { getBaseUrl, getStripe } from '~/src/lib/stripe';

const customizationSchema = z.object({
  recipientName: z.string().min(1).max(100),
  relationship: z.string().min(1).max(50),
  occasion: z.string().min(1).max(100),
  message: z.string().min(1).max(500),
  generatedAt: z.string().optional(),
});

const cartItemSchema = z.object({
  cardId: z.string(),
  variant: z.enum(['physical', 'digital']),
  quantity: z.number().int().min(1).max(99),
  customization: customizationSchema.optional(),
});

const checkoutSchema = z.object({
  items: z.array(cartItemSchema).min(1).max(50),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = checkoutSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid cart data', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { items } = parsed.data;

    const CUSTOMIZATION_FEE = 2.0;

    // Build line items from cart
    const lineItems = items.map((item) => {
      const card = cards.find((c) => c.id === item.cardId);
      if (!card) {
        throw new Error(`Card not found: ${item.cardId}`);
      }

      const basePrice = card.pricing[item.variant as CardVariant];
      const price = item.customization ? basePrice + CUSTOMIZATION_FEE : basePrice;
      const variantLabel = item.variant === 'physical' ? 'Physical Card' : 'Digital Download';
      const customLabel = item.customization ? ' (Personalized)' : '';

      const description = item.customization
        ? `${variantLabel} - For ${item.customization.recipientName}`
        : `${variantLabel} - ${card.occasion}`;

      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${card.name}${customLabel}`,
            description,
            images: [`${getBaseUrl()}${card.src}`],
            metadata: {
              cardId: card.id,
              variant: item.variant,
              ...(item.customization && {
                customized: 'true',
                recipientName: item.customization.recipientName,
                relationship: item.customization.relationship,
              }),
            },
          },
          unit_amount: Math.round(price * 100), // Convert to cents
        },
        quantity: item.quantity,
      };
    });

    const baseUrl = getBaseUrl();

    // Prepare items with customization for metadata (Stripe has 500 char limit per key)
    const itemsForMetadata = items.map((item) => ({
      cardId: item.cardId,
      variant: item.variant,
      quantity: item.quantity,
      ...(item.customization && {
        customization: {
          recipientName: item.customization.recipientName,
          relationship: item.customization.relationship,
          occasion: item.customization.occasion,
          message: item.customization.message.slice(0, 400), // Truncate if needed
        },
      }),
    }));

    // Check if any items require shipping
    const hasPhysicalItems = items.some((item) => item.variant === 'physical');

    const session = await getStripe().checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      success_url: `${baseUrl}/shop/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/shop`,
      metadata: {
        items: JSON.stringify(itemsForMetadata),
      },
      // Collect shipping address for physical items
      ...(hasPhysicalItems && {
        shipping_address_collection: {
          allowed_countries: ['US', 'CA'],
        },
      }),
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Checkout session error:', error);

    if (error instanceof Error && error.message.startsWith('Card not found')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
