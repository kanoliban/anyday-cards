import {
  Configuration,
  PostcardsApi,
  PostcardEditable,
  PostcardSize,
  PscUseType,
  CountryExtended,
} from '@lob/lob-typescript-sdk';

import { cards } from '~/src/app/create/constants';
import type {
  FulfillmentRequest,
  FulfillmentResult,
  ShippingAddress,
} from '~/src/types/fulfillment';

import { getCardBackHtml } from './lob-templates';
import { getBaseUrl } from './stripe';

let postcards: PostcardsApi | null = null;

export function getLobPostcards(): PostcardsApi {
  if (!postcards) {
    if (!process.env.LOB_API_SECRET) {
      throw new Error('LOB_API_SECRET is not set');
    }
    const config = new Configuration({ username: process.env.LOB_API_SECRET });
    postcards = new PostcardsApi(config);
  }
  return postcards;
}

function mapCountry(country: string): CountryExtended {
  const countryMap: Record<string, CountryExtended> = {
    US: CountryExtended.Us,
    CA: CountryExtended.Ca,
  };
  return countryMap[country.toUpperCase()] ?? CountryExtended.Us;
}

function createLobAddress(address: ShippingAddress) {
  return {
    name: address.name,
    address_line1: address.line1,
    address_line2: address.line2 ?? undefined,
    address_city: address.city,
    address_state: address.state,
    address_zip: address.postalCode,
    address_country: mapCountry(address.country),
  };
}

export async function fulfillPhysicalCards(
  request: FulfillmentRequest
): Promise<FulfillmentResult[]> {
  const api = getLobPostcards();
  const results: FulfillmentResult[] = [];
  const baseUrl = getBaseUrl();

  for (const item of request.items) {
    const card = cards.find((c) => c.id === item.cardId);
    if (!card) {
      results.push({
        cardId: item.cardId,
        lobPostcardId: null,
        status: 'failed',
        error: `Card not found: ${item.cardId}`,
      });
      continue;
    }

    // Create a postcard for each quantity
    for (let i = 0; i < item.quantity; i++) {
      try {
        const recipientName = item.customization?.recipientName ?? 'Friend';
        const message =
          item.customization?.message ?? 'Thinking of you!';

        const postcardData = new PostcardEditable({
          to: createLobAddress(request.shippingAddress),
          size: PostcardSize._6x9,
          front: `${baseUrl}${card.src}`,
          back: getCardBackHtml({
            recipientName,
            message,
            occasion: item.customization?.occasion ?? card.occasion,
          }),
          description: `AnyDay Card - ${card.name} for ${recipientName}`,
          use_type: PscUseType.Marketing,
          metadata: {
            order_id: request.orderId,
            card_id: item.cardId,
            recipient_name: recipientName.slice(0, 40),
          },
        });

        const postcard = await api.create(postcardData);

        results.push({
          cardId: item.cardId,
          lobPostcardId: postcard.id,
          status: 'submitted',
          submittedAt: new Date().toISOString(),
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        console.error(`Failed to create postcard for ${item.cardId}:`, error);
        results.push({
          cardId: item.cardId,
          lobPostcardId: null,
          status: 'failed',
          error: errorMessage,
        });
      }
    }
  }

  return results;
}
