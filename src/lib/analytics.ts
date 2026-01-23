/**
 * Analytics Utility for A/B Testing
 *
 * Wraps Umami tracking with automatic cohort tagging for ADC A/B tests.
 * All events are tagged with the user's cohort for comparison analysis.
 */

import { getCohort, type Cohort } from './ab-testing';

/**
 * Analytics event names for ADC A/B testing
 */
export const ADC_EVENTS = {
  MESSAGE_GENERATED: 'adc_message_generated',
  MESSAGE_REGENERATED: 'adc_message_regenerated',
  CHECKOUT_STARTED: 'adc_checkout_started',
  PURCHASE_COMPLETED: 'adc_purchase_completed',
  WIZARD_STEP_COMPLETED: 'adc_wizard_step_completed',
  CARD_SELECTED: 'adc_card_selected',
} as const;

export type ADCEventName = (typeof ADC_EVENTS)[keyof typeof ADC_EVENTS];

/**
 * Event metadata for ADC analytics
 */
export interface ADCEventMetadata {
  cohort: Cohort;
  version?: string;
  occasion?: string;
  relationship?: string;
  vibes?: string[];
  cardType?: 'digital' | 'physical';
  regenerationCount?: number;
  step?: string;
  [key: string]: unknown;
}

/**
 * Track an ADC A/B testing event
 *
 * Automatically includes cohort in all events.
 * Events are sent to Umami for analytics.
 *
 * @param event - The event name (use ADC_EVENTS constants)
 * @param metadata - Additional event metadata (cohort is added automatically)
 */
export function trackADCEvent(
  event: ADCEventName | string,
  metadata?: Omit<ADCEventMetadata, 'cohort'>,
): void {
  if (typeof window === 'undefined') {
    return;
  }

  const cohort = getCohort();

  const eventData: ADCEventMetadata = {
    cohort,
    ...metadata,
  };

  // Track via Umami if available
  const umami = (window as unknown as { umami?: { track: (event: string, data: Record<string, unknown>) => void } }).umami;
  if (umami?.track) {
    try {
      umami.track(event, eventData);
    } catch (e) {
      console.error('[Analytics] Umami tracking error:', e);
    }
  }

  // Also log to console in development for debugging
  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics]', event, eventData);
  }

  // Send to our API for server-side logging/storage
  sendToAPI(event, eventData).catch(() => {
    // Silent fail - analytics should never block UX
  });
}

/**
 * Send event to our analytics API endpoint
 */
async function sendToAPI(event: string, data: ADCEventMetadata): Promise<void> {
  try {
    await fetch('/api/analytics/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event, ...data, timestamp: Date.now() }),
    });
  } catch {
    // Silent fail
  }
}

/**
 * Track message generation event
 */
export function trackMessageGenerated(
  version: string,
  metadata?: {
    occasion?: string;
    relationship?: string;
    vibes?: string[];
    isFallback?: boolean;
  },
): void {
  trackADCEvent(ADC_EVENTS.MESSAGE_GENERATED, {
    version,
    ...metadata,
    regenerationCount: 0,
  });
}

/**
 * Track message regeneration event
 */
export function trackMessageRegenerated(
  version: string,
  regenerationCount: number,
  metadata?: {
    occasion?: string;
    relationship?: string;
    vibes?: string[];
  },
): void {
  trackADCEvent(ADC_EVENTS.MESSAGE_REGENERATED, {
    version,
    regenerationCount,
    ...metadata,
  });
}

/**
 * Track checkout started event
 */
export function trackCheckoutStarted(
  version: string,
  cardType: 'digital' | 'physical',
): void {
  trackADCEvent(ADC_EVENTS.CHECKOUT_STARTED, {
    version,
    cardType,
  });
}

/**
 * Track successful purchase event
 */
export function trackPurchaseCompleted(
  version: string,
  metadata: {
    cardType: 'digital' | 'physical';
    orderValue?: number;
  },
): void {
  trackADCEvent(ADC_EVENTS.PURCHASE_COMPLETED, {
    version,
    ...metadata,
  });
}

/**
 * Track wizard step completion
 */
export function trackWizardStep(step: string): void {
  trackADCEvent(ADC_EVENTS.WIZARD_STEP_COMPLETED, { step });
}

/**
 * Track card selection
 */
export function trackCardSelected(cardName: string): void {
  trackADCEvent(ADC_EVENTS.CARD_SELECTED, { cardName });
}
