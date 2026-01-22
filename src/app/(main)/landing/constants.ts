import type { Icon } from '@phosphor-icons/react';
import {
  PenNib,
  Sparkle,
  EnvelopeSimple,
  Brain,
  CalendarBlank,
  Heart,
  Palette,
  Clock,
  ShieldCheck,
  CheckCircle,
} from '@phosphor-icons/react/dist/ssr';

export type Step = {
  icon: Icon;
  title: string;
  description: string;
  color: string;
};

export const STEPS: Step[] = [
  {
    icon: PenNib,
    title: 'Share the Details',
    description:
      'Answer a few fun questions about your relationship, the occasion, and shared memories. No login needed.',
    color: 'theme-1',
  },
  {
    icon: Sparkle,
    title: 'AI Crafts Magic',
    description:
      'Our AI generates a completely unique message based on your inputs. No templates, just authentic words.',
    color: 'indigo',
  },
  {
    icon: EnvelopeSimple,
    title: 'We Print & Ship',
    description:
      'We print your creation on premium stock and mail it directly to your recipient.',
    color: 'teal',
  },
];

export type Feature = {
  icon: Icon;
  title: string;
  description: string;
};

export const FEATURES: Feature[] = [
  {
    icon: Brain,
    title: 'Infinite Creativity',
    description:
      'Whether you want funny, sentimental, or weird, our AI adapts to your vibe perfectly.',
  },
  {
    icon: CalendarBlank,
    title: 'For Every Occasion',
    description:
      "Birthdays, anniversaries, or just because. We support all relationship types including \"it's complicated\".",
  },
  {
    icon: Heart,
    title: 'Truly Personal',
    description:
      'The card will reference that specific road trip or inside joke you share, making it a keepsake.',
  },
];

export type PricingTier = {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  popular?: boolean;
  cta: string;
  variant: 'default' | 'popular' | 'outline';
};

export const PRICING_TIERS: PricingTier[] = [
  {
    name: 'Single Card',
    price: '$12',
    period: '/ card',
    description: 'Perfect for the spontaneous moment.',
    features: [
      'Unlimited AI text generations',
      'Custom AI cover art',
      'Standard shipping included',
    ],
    cta: 'Create Your Card',
    variant: 'default',
  },
  {
    name: 'Monthly',
    price: '$29',
    period: '/ month',
    description: '3 cards per month, plus priority printing.',
    features: [
      '3 cards/month included',
      'Priority printing queue',
      'Member-only design styles',
    ],
    popular: true,
    cta: 'Start subscription',
    variant: 'popular',
  },
  {
    name: 'Teams',
    price: 'Custom',
    period: '',
    description: 'For companies sending client or employee notes.',
    features: ['Shared address books', 'Approval workflows', 'Volume billing'],
    cta: 'Contact sales',
    variant: 'outline',
  },
];

export const SOCIAL_PROOF = [
  'Vogue',
  'The New York Times',
  'Wired',
  'ProductHunt',
];

export const FOOTER_LINKS = {
  Product: [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Examples', href: '/card' },
  ],
  Company: [
    { label: 'About Us', href: '/about' },
    { label: 'Contact', href: 'mailto:hello@anydaycard.com' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
  ],
};
