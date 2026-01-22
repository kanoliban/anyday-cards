/**
 * Shipping & fulfillment types for physical card delivery via Lob
 */

export type ShippingAddress = {
  name: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

export type FulfillmentItemStatus =
  | 'pending'
  | 'submitted'
  | 'mailed'
  | 'in_transit'
  | 'delivered'
  | 'returned'
  | 'failed';

export type FulfillmentResult = {
  cardId: string;
  lobPostcardId: string | null;
  status: FulfillmentItemStatus;
  trackingUrl?: string;
  error?: string;
  submittedAt?: string;
  mailedAt?: string;
  deliveredAt?: string;
};

export type FulfillmentStatus =
  | 'pending'
  | 'processing'
  | 'partially_fulfilled'
  | 'fulfilled'
  | 'delivered'
  | 'failed';

export type FulfillmentRequest = {
  orderId: string;
  items: PhysicalCardItem[];
  shippingAddress: ShippingAddress;
};

export type PhysicalCardItem = {
  cardId: string;
  quantity: number;
  customization?: {
    recipientName: string;
    relationship: string;
    occasion: string;
    message: string;
  };
};

/**
 * Lob webhook event types we care about
 * See: https://help.lob.com/print-and-mail/getting-data-and-results/using-webhooks
 */
export type LobEventType =
  | 'postcard.created'
  | 'postcard.rendered_pdf'
  | 'postcard.rendered_thumbnails'
  | 'postcard.deleted'
  | 'postcard.delivered'
  | 'postcard.failed'
  | 'postcard.mailed'
  | 'postcard.in_transit'
  | 'postcard.in_local_area'
  | 'postcard.processed_for_delivery'
  | 'postcard.re-routed'
  | 'postcard.returned_to_sender';

export type LobWebhookEvent = {
  id: string;
  body: {
    id: string;
    description?: string;
    metadata?: Record<string, string>;
    send_date?: string;
    mail_type?: string;
    expected_delivery_date?: string;
    date_created?: string;
    date_modified?: string;
    tracking_events?: Array<{
      id: string;
      time: string;
      type: string;
      name: string;
      location?: string;
    }>;
  };
  event_type: {
    id: LobEventType;
    enabled_for_test: boolean;
    resource: string;
    object: string;
  };
  date_created: string;
  object: string;
  reference_id: string;
};
