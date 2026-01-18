import Link from 'next/link';

import MousePositionVarsSetter from '~/src/components/MousePositionVarsSetter';
import Button from '~/src/components/ui/Button';
import ViewCounter from '~/src/components/ViewCounter';

import {
  BioCard,
  BukaCard,
  CodeCard,
  ColorThemeCard,
  ExperienceCard,
  NotesCard,
  PantoneCard,
  PhotosCard,
  SketchbookCard,
  SkewedCardsCard,
  SneakPeekCard,
  StatusCard,
  ToolsCard,
  WorkspaceCard,
} from './components';
import Header from './components/Header';
import Heading from './components/Heading';

import './page.css';

import { Metadata } from 'next';

import SystemMetricsCollector from '~/src/lib/SystemMetricsCollector';
import { withTimeout } from '~/src/util';

const ctaLinks = [
  { label: 'Browse Cards', href: '/work' },
  { label: 'Shop Now', href: '/shop' },
] as const;

const getCards = ({ sketchbookCard }: { sketchbookCard: boolean }) => [
  { gridArea: '👋', Component: BioCard },
  { gridArea: '👔', Component: ExperienceCard },
  { gridArea: '💬', Component: StatusCard },
  { gridArea: '📌', Component: WorkspaceCard },
  { gridArea: '🖌️', Component: PantoneCard },
  { gridArea: '🎨', Component: ColorThemeCard },
  { gridArea: '👀', Component: SneakPeekCard },
  { gridArea: '🖼️', Component: PhotosCard },
  { gridArea: '💯', Component: BukaCard },
  { gridArea: '🧪', Component: CodeCard },
  { gridArea: '👩‍💻', Component: sketchbookCard ? SketchbookCard : ToolsCard },
  { gridArea: '💌', Component: SkewedCardsCard },
  { gridArea: '📝', Component: NotesCard },
];

const fetchSneakPeekCount = ({ timeout = 1000 }) => {
  const responsePromise = fetch(
    process.env.NEXT_PUBLIC_HOST +
      '/api/stats?' +
      new URLSearchParams([
        ['pathname', '/#sneak-peek'],
        ['type', 'action'],
      ]),
    { cache: 'no-store' },
  )
    .then(async (res) => {
      if (!res.ok) return 0;
      const text = await res.text();
      if (!text) return 0;
      try {
        return JSON.parse(text).count ?? 0;
      } catch {
        return 0;
      }
    })
    .catch(() => 0);

  return withTimeout(responsePromise, 0, timeout);
};

const fetchSystemMetrics = ({ timeout = 1000 }) => {
  const responsePromise = SystemMetricsCollector.collect().catch((e) => {
    console.error(e);
    return SystemMetricsCollector.default({ reason: e?.message ?? 'collector error' });
  });

  return withTimeout(
    responsePromise,
    SystemMetricsCollector.default({ reason: `timeout ${timeout}ms` }),
    timeout,
  );
};

export const metadata: Metadata = {
  title: 'anydaycard | Thoughtful cards, any occasion',
  description:
    'AI-generated greeting cards for every occasion. Premium paper, timeless designs, available as physical prints or digital downloads.',
};

export default async function Home() {
  const [currentCount, metrics] = await Promise.all([
    fetchSneakPeekCount({ timeout: 1000 }),
    fetchSystemMetrics({ timeout: 1000 }),
  ]);

  return (
    <div>
      <Header />
      <ViewCounter pathname="/" />
      <MousePositionVarsSetter />
      <div className="glow pointer-events-none fixed h-[400px] w-[400px] rounded-full blur-3xl" />
      <div className="flex flex-col px-5 py-5 md:py-12">
        <main className="pb-12">
          <Heading className="mb-8" />
          <div className="mb-20 flex flex-col items-start gap-3 text-text-primary xxs:flex-row xxs:items-center xxs:gap-4">
            <p className="text-lg text-text-secondary">AI-generated designs, premium paper</p>
            <div className="flex gap-2">
              {ctaLinks.map(({ label, href }) => (
                <Button size="sm" asChild key={label}>
                  <Link href={href}>{label}</Link>
                </Button>
              ))}
            </div>
          </div>
          <div className="home-cards">
            {getCards({ sketchbookCard: true }).map(({ gridArea, Component }, i) => (
              <div key={i} style={{ gridArea }}>
                <Component currentCount={currentCount || 0} metrics={metrics} />
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
