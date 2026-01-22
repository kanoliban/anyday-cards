import { Metadata } from 'next';

import {
  Hero,
  SocialProof,
  HowItWorks,
  Features,
  Pricing,
  LandingNav,
  LandingFooter,
} from './landing';

export const metadata: Metadata = {
  title: 'AnyDayCard | Cards that sound like you',
  description:
    'AI-generated greeting cards for every occasion. Premium paper, timeless designs, available as physical prints or digital downloads.',
};

export default function LandingPage() {
  return (
    <div className="texture-paper min-h-dvh">
      <LandingNav />
      <main>
        <Hero />
        <SocialProof />
        <HowItWorks />
        <Features />
        <Pricing />
      </main>
      <LandingFooter />
    </div>
  );
}
