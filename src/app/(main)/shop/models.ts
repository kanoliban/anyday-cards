import type { Card, CardVariant, WizardAnswers } from '~/src/app/cards/models';

export type CardCustomization = {
  recipientName: string;
  relationship: string;
  occasion: string;
  message: string;
  wizardAnswers?: WizardAnswers;
  generatedAt?: string;
};

export type CartItem = {
  card: Card;
  variant: CardVariant;
  quantity: number;
  customization?: CardCustomization;
};

export type CartItemKey = `${string}-${CardVariant}-${string}`;

export function getCartItemKey(
  cardId: string,
  variant: CardVariant,
  customization?: CardCustomization,
): CartItemKey {
  const customKey = customization ? `-custom-${Date.now()}` : '';
  return `${cardId}-${variant}${customKey}` as CartItemKey;
}

export function getItemPrice(item: CartItem): number {
  const basePrice = item.card.pricing[item.variant];
  const customizationFee = item.customization ? 2.0 : 0;
  return (basePrice + customizationFee) * item.quantity;
}
