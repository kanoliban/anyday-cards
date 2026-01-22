import { NextResponse } from 'next/server';

import { createServiceClient } from '~/src/supabase/server';
import type {
  FulfillmentItemStatus,
  FulfillmentResult,
  LobEventType,
  LobWebhookEvent,
} from '~/src/types/fulfillment';

/**
 * Lob webhook handler for postcard tracking events
 * Configure webhook URL in Lob dashboard: https://dashboard.lob.com/#/webhooks
 */
export async function POST(req: Request) {
  try {
    const event = (await req.json()) as LobWebhookEvent;

    // Verify this is a postcard event
    if (!event.event_type?.id?.startsWith('postcard.')) {
      return NextResponse.json({ received: true, skipped: true });
    }

    const lobPostcardId = event.body?.id;
    const orderId = event.body?.metadata?.order_id;
    const eventType = event.event_type.id as LobEventType;

    if (!lobPostcardId || !orderId) {
      console.warn('Lob webhook missing postcard ID or order ID:', event);
      return NextResponse.json({ received: true, skipped: true });
    }

    console.log(`Lob webhook: ${eventType} for postcard ${lobPostcardId}`);

    await handleLobEvent(orderId, lobPostcardId, eventType);

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Lob webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

function mapLobEventToStatus(eventType: LobEventType): FulfillmentItemStatus {
  const statusMap: Record<LobEventType, FulfillmentItemStatus> = {
    'postcard.created': 'submitted',
    'postcard.rendered_pdf': 'submitted',
    'postcard.rendered_thumbnails': 'submitted',
    'postcard.deleted': 'failed',
    'postcard.mailed': 'mailed',
    'postcard.in_transit': 'in_transit',
    'postcard.in_local_area': 'in_transit',
    'postcard.processed_for_delivery': 'in_transit',
    'postcard.re-routed': 'in_transit',
    'postcard.delivered': 'delivered',
    'postcard.failed': 'failed',
    'postcard.returned_to_sender': 'returned',
  };

  return statusMap[eventType] ?? 'submitted';
}

async function handleLobEvent(
  orderId: string,
  lobPostcardId: string,
  eventType: LobEventType
) {
  const supabase = createServiceClient();

  // Fetch current order
  const { data: order, error: fetchError } = await supabase
    .from('orders')
    .select('fulfillment_results, fulfillment_status')
    .eq('id', orderId)
    .single();

  if (fetchError || !order) {
    console.error(`Order not found: ${orderId}`, fetchError);
    return;
  }

  const results = (order.fulfillment_results as FulfillmentResult[]) ?? [];
  const newStatus = mapLobEventToStatus(eventType);

  // Update the specific postcard result
  const updatedResults = results.map((result) => {
    if (result.lobPostcardId === lobPostcardId) {
      return {
        ...result,
        status: newStatus,
        ...(newStatus === 'mailed' && { mailedAt: new Date().toISOString() }),
        ...(newStatus === 'delivered' && {
          deliveredAt: new Date().toISOString(),
        }),
        ...(newStatus === 'failed' && { error: `Event: ${eventType}` }),
      };
    }
    return result;
  });

  // Calculate overall fulfillment status
  const allDelivered = updatedResults.every((r) => r.status === 'delivered');
  const allFailed = updatedResults.every(
    (r) => r.status === 'failed' || r.status === 'returned'
  );
  const anyFailed = updatedResults.some(
    (r) => r.status === 'failed' || r.status === 'returned'
  );
  const anyDelivered = updatedResults.some((r) => r.status === 'delivered');

  let overallStatus = order.fulfillment_status;
  if (allDelivered) {
    overallStatus = 'delivered';
  } else if (allFailed) {
    overallStatus = 'failed';
  } else if (anyDelivered || anyFailed) {
    overallStatus = 'partially_fulfilled';
  } else if (updatedResults.some((r) => r.status === 'mailed')) {
    overallStatus = 'fulfilled';
  }

  // Update order
  const { error: updateError } = await supabase
    .from('orders')
    .update({
      fulfillment_results: updatedResults,
      fulfillment_status: overallStatus,
    })
    .eq('id', orderId);

  if (updateError) {
    console.error(`Failed to update order ${orderId}:`, updateError);
  } else {
    console.log(
      `Order ${orderId} updated: ${eventType} -> ${overallStatus}`,
      updatedResults
    );
  }
}
