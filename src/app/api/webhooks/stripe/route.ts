import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

import { sendDigitalCardEmail } from '~/src/lib/email';
import { fulfillPhysicalCards } from '~/src/lib/lob';
import { getStripe } from '~/src/lib/stripe';
import { createServiceClient } from '~/src/supabase/server';
import type { PhysicalCardItem, ShippingAddress } from '~/src/types/fulfillment';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: Request) {
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not set');
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    );
  }

  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error(`Webhook signature verification failed: ${errorMessage}`);
    return NextResponse.json(
      { error: `Webhook Error: ${errorMessage}` },
      { status: 400 }
    );
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    try {
      await handleCheckoutComplete(session);
    } catch (err) {
      console.error('Error handling checkout.session.completed:', err);
      // Return 200 to acknowledge receipt (Stripe will retry otherwise)
      // Log error for investigation
    }
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const supabase = createServiceClient();

  // Parse items from session metadata (split across keys due to Stripe's 500 char/key limit)
  const metadata = session.metadata ?? {};
  const itemCount = parseInt(metadata.itemCount ?? '0', 10);
  const items: Array<{
    cardId: string;
    variant: string;
    quantity: number;
    customization?: {
      recipientName: string;
      relationship: string;
      occasion: string;
      message: string;
    };
  }> = [];

  for (let i = 0; i < itemCount; i++) {
    const coreJson = metadata[`item_${i}_core`];
    const customJson = metadata[`item_${i}_custom`];

    if (coreJson) {
      const core = JSON.parse(coreJson);
      const item: (typeof items)[0] = {
        cardId: core.cardId,
        variant: core.variant,
        quantity: core.quantity,
      };

      if (customJson) {
        item.customization = JSON.parse(customJson);
      }

      items.push(item);
    }
  }

  // Extract shipping address if present (type assertion needed for checkout session)
  const shippingDetails = (
    session as Stripe.Checkout.Session & {
      shipping_details?: {
        name?: string | null;
        address?: {
          line1?: string | null;
          line2?: string | null;
          city?: string | null;
          state?: string | null;
          postal_code?: string | null;
          country?: string | null;
        } | null;
      } | null;
    }
  ).shipping_details;
  const shippingAddress: ShippingAddress | null = shippingDetails?.address
    ? {
        name: shippingDetails.name ?? '',
        line1: shippingDetails.address.line1 ?? '',
        line2: shippingDetails.address.line2 ?? null,
        city: shippingDetails.address.city ?? '',
        state: shippingDetails.address.state ?? '',
        postalCode: shippingDetails.address.postal_code ?? '',
        country: shippingDetails.address.country ?? 'US',
      }
    : null;

  // Insert order and get ID
  const { data: order, error } = await supabase
    .from('orders')
    .insert({
      stripe_session_id: session.id,
      stripe_payment_intent:
        typeof session.payment_intent === 'string'
          ? session.payment_intent
          : session.payment_intent?.id ?? null,
      customer_email: session.customer_details?.email ?? null,
      items,
      subtotal: session.amount_total ?? 0,
      status: 'completed',
      shipping_address: shippingAddress,
      fulfillment_status: 'pending',
    })
    .select('id')
    .single();

  if (error) {
    console.error('Failed to insert order:', error);
    throw error;
  }

  console.log(`Order created: ${order.id}`);

  // Send email for digital items
  const digitalItems = items
    .filter((item: { variant: string }) => item.variant === 'digital')
    .map((item) => ({
      ...item,
      variant: 'digital' as const,
    }));
  if (session.customer_details?.email && digitalItems.length > 0) {
    const emailSent = await sendDigitalCardEmail({
      customerEmail: session.customer_details.email,
      items: digitalItems,
    });

    if (emailSent) {
      await supabase
        .from('orders')
        .update({ email_sent_at: new Date().toISOString() })
        .eq('id', order.id);
      console.log(`Email sent for order: ${order.id}`);
    }
  }

  // Fulfill physical cards via Lob
  const physicalItems: PhysicalCardItem[] = items
    .filter((item: { variant: string }) => item.variant === 'physical')
    .map(
      (item: {
        cardId: string;
        quantity: number;
        customization?: {
          recipientName: string;
          relationship: string;
          occasion: string;
          message: string;
        };
      }) => ({
        cardId: item.cardId,
        quantity: item.quantity,
        customization: item.customization,
      })
    );

  if (physicalItems.length > 0 && shippingAddress) {
    try {
      const fulfillmentResults = await fulfillPhysicalCards({
        orderId: order.id,
        items: physicalItems,
        shippingAddress,
      });

      const allSubmitted = fulfillmentResults.every(
        (r) => r.status === 'submitted'
      );
      const anyFailed = fulfillmentResults.some((r) => r.status === 'failed');

      await supabase
        .from('orders')
        .update({
          fulfillment_status: anyFailed
            ? 'partially_fulfilled'
            : allSubmitted
              ? 'processing'
              : 'pending',
          fulfillment_results: fulfillmentResults,
          fulfillment_submitted_at: new Date().toISOString(),
        })
        .eq('id', order.id);

      console.log(
        `Physical fulfillment submitted for order: ${order.id}`,
        fulfillmentResults
      );
    } catch (fulfillmentError) {
      console.error(
        `Failed to fulfill physical cards for order ${order.id}:`,
        fulfillmentError
      );
      await supabase
        .from('orders')
        .update({
          fulfillment_status: 'failed',
          fulfillment_results: [
            {
              error:
                fulfillmentError instanceof Error
                  ? fulfillmentError.message
                  : 'Unknown error',
            },
          ],
        })
        .eq('id', order.id);
    }
  }
}
