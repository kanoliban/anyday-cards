import type { Card, CardCollection } from './models';

export const baseCollections: Record<string, CardCollection> = {
  celebrations: {
    colors: { bg: '#FFF5EB', fg: '#C4724E', mutedBg: '#FFF9F5', mutedFg: '#E8A87C' },
    cards: [
      {
        id: 'birthday-warm',
        name: 'Warm Birthday Wishes',
        occasion: 'Birthday',
        style: 'typographic',
        tone: 'warm',
        colors: ['Coral', 'Cream'],
        size: 'A2 (4.25 x 5.5)',
        paperStock: 'Cotton 110lb',
        description: 'A timeless birthday greeting with warm, earthy tones. Perfect for anyone who appreciates classic elegance.',
        src: '/cards/birthday-warm.svg',
        srcLg: '/cards/lg/birthday-warm.svg',
        srcBack: '/cards/back/birthday-warm-back.svg',
        srcLgBack: '/cards/lg/back/birthday-warm-back.svg',
      },
      {
        id: 'birthday-playful',
        name: 'Playful Birthday Celebration',
        occasion: 'Birthday',
        style: 'illustrated',
        tone: 'playful',
        colors: ['Pink', 'Rose'],
        size: 'A2 (4.25 x 5.5)',
        paperStock: 'Matte 100lb',
        description: 'Bright and cheerful birthday card with whimsical balloons and cake. Ideal for kids or the young at heart.',
        src: '/cards/birthday-playful.svg',
        srcLg: '/cards/lg/birthday-playful.svg',
        srcBack: '/cards/back/birthday-playful-back.svg',
        srcLgBack: '/cards/lg/back/birthday-playful-back.svg',
      },
      {
        id: 'congratulations-minimal',
        name: 'Simple Congratulations',
        occasion: 'Congratulations',
        style: 'minimal',
        tone: 'minimal',
        colors: ['White', 'Gray'],
        size: 'A2 (4.25 x 5.5)',
        paperStock: 'Premium Smooth 120lb',
        description: 'Clean, modern congratulations card. Lets your words speak volumes with understated design.',
        src: '/cards/congratulations-minimal.svg',
        srcLg: '/cards/lg/congratulations-minimal.svg',
        srcBack: '/cards/back/congratulations-minimal-back.svg',
        srcLgBack: '/cards/lg/back/congratulations-minimal-back.svg',
      },
    ],
  },
  gratitude: {
    colors: { bg: '#FAFAF8', fg: '#2C2C2C', mutedBg: '#FFFFFF', mutedFg: '#666666' },
    cards: [
      {
        id: 'thankyou-elegant',
        name: 'Elegant Thank You',
        occasion: 'Thank You',
        style: 'typographic',
        tone: 'elegant',
        colors: ['Ivory', 'Charcoal'],
        size: 'A2 (4.25 x 5.5)',
        paperStock: 'Linen 100lb',
        description: 'Sophisticated thank you card with classic typography. Appropriate for professional or formal occasions.',
        src: '/cards/thankyou-elegant.svg',
        srcLg: '/cards/lg/thankyou-elegant.svg',
        srcBack: '/cards/back/thankyou-elegant-back.svg',
        srcLgBack: '/cards/lg/back/thankyou-elegant-back.svg',
      },
    ],
  },
  seasonal: {
    colors: { bg: '#1B4332', fg: '#D4AF37', mutedBg: '#2D5A45', mutedFg: '#B8963A' },
    cards: [
      {
        id: 'holiday-festive',
        name: 'Festive Holiday Greetings',
        occasion: 'Holiday',
        style: 'illustrated',
        tone: 'festive',
        colors: ['Forest Green', 'Gold'],
        size: 'A2 (4.25 x 5.5)',
        paperStock: 'Velvet 110lb',
        description: 'Rich, festive holiday card with classic star motif. Perfect for Christmas, Hanukkah, or general holiday wishes.',
        src: '/cards/holiday-festive.svg',
        srcLg: '/cards/lg/holiday-festive.svg',
        srcBack: '/cards/back/holiday-festive-back.svg',
        srcLgBack: '/cards/lg/back/holiday-festive-back.svg',
      },
    ],
  },
  everyday: {
    colors: { bg: '#E8F4F8', fg: '#5B8A9A', mutedBg: '#F2F9FB', mutedFg: '#8BB5C4' },
    cards: [
      {
        id: 'thinking-of-you',
        name: 'Thinking of You',
        occasion: 'Just Because',
        style: 'illustrated',
        tone: 'serene',
        colors: ['Sky Blue', 'White'],
        size: 'A2 (4.25 x 5.5)',
        paperStock: 'Cotton 100lb',
        description: 'Gentle, calming card for when you want someone to know they\'re in your thoughts. No occasion needed.',
        src: '/cards/thinking-of-you.svg',
        srcLg: '/cards/lg/thinking-of-you.svg',
        srcBack: '/cards/back/thinking-of-you-back.svg',
        srcLgBack: '/cards/lg/back/thinking-of-you-back.svg',
      },
    ],
  },
};

export const collections = Object.fromEntries(
  Object.entries(baseCollections).map(([key, value]) => [
    key,
    {
      ...value,
      cards: value.cards.map((card, index) => ({
        ...card,
        id: card.id || `${key}-${index}`,
      })),
    },
  ]),
);

export type CollectionType = keyof typeof baseCollections;

export const collectionTypes = Object.keys(collections) as CollectionType[];

export const cards = Object.values(collections).flatMap((collection) => collection.cards);
