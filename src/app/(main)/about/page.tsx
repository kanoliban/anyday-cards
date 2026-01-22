'use client';

import MousePositionVarsSetter from '~/src/components/MousePositionVarsSetter';
import ViewCounter from '~/src/components/ViewCounter';
import CopyToClipboard from '~/src/components/CopyToClipboard';
import InteractiveBook, { type BookPage } from '~/src/components/ui/interactive-book';

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
} from '../components';
import Header from '../components/Header';

import './page.css';

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

const bookPages: BookPage[] = [
  {
    pageNumber: 1,
    title: 'Why Cards Matter',
    content: (
      <div className="space-y-4">
        <p>
          A card isn&apos;t just paper. It&apos;s a moment — a pause in someone&apos;s day to feel
          seen, appreciated, or loved.
        </p>
        <p>
          The best cards aren&apos;t the ones with the cleverest words. They&apos;re the ones that
          sound like <em>you</em>.
        </p>
      </div>
    ),
    backContent: (
      <div className="space-y-4">
        <p className="italic text-neutral-500">
          &ldquo;I&apos;ve kept every card my grandmother wrote me. Not because of what she said,
          but because I could hear her voice in every word.&rdquo;
        </p>
      </div>
    ),
  },
  {
    pageNumber: 2,
    title: 'Start With a Feeling',
    content: (
      <div className="space-y-4">
        <p>Before you write anything, ask yourself:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>How do I actually feel about this person?</li>
          <li>What&apos;s one specific thing I appreciate?</li>
          <li>What moment comes to mind when I think of them?</li>
        </ul>
        <p className="mt-4 text-sm text-neutral-500">
          The feeling is the foundation. Everything else builds on it.
        </p>
      </div>
    ),
    backContent: (
      <div className="space-y-4">
        <p className="font-medium">Try this:</p>
        <p>
          Close your eyes. Picture the person. What&apos;s the first memory that surfaces? Start
          there.
        </p>
      </div>
    ),
  },
  {
    pageNumber: 3,
    title: 'Be Specific',
    content: (
      <div className="space-y-4">
        <p>Generic cards get forgotten. Specific ones get kept.</p>
        <div className="space-y-2 rounded bg-neutral-100 p-3 text-sm">
          <p>
            <span className="text-neutral-400 line-through">
              &ldquo;Thanks for always being there.&rdquo;
            </span>
          </p>
          <p>
            <span className="text-neutral-700">
              &ldquo;Thanks for answering my 2am panic calls about the job interview. You talked me
              off the ledge — twice.&rdquo;
            </span>
          </p>
        </div>
      </div>
    ),
    backContent: (
      <div className="space-y-4">
        <p className="font-medium">The specificity test:</p>
        <p>
          Could you send this card to five different people? If yes, it&apos;s too generic. Make it
          about <em>them</em>.
        </p>
      </div>
    ),
  },
  {
    pageNumber: 4,
    title: 'Write How You Talk',
    content: (
      <div className="space-y-4">
        <p>Cards get weird when we try to sound &ldquo;card-like.&rdquo;</p>
        <p>
          If you wouldn&apos;t say it out loud to them, don&apos;t write it. The best messages sound
          like a voice memo, not a Hallmark template.
        </p>
        <p className="text-sm text-neutral-500">
          Contractions? Use them. Inside jokes? Perfect. Their nickname? Even better.
        </p>
      </div>
    ),
    backContent: (
      <div className="space-y-4">
        <p className="font-medium">Quick trick:</p>
        <p>Imagine texting them. Write that first. Then clean it up just enough for paper.</p>
      </div>
    ),
  },
  {
    pageNumber: 5,
    title: 'Short is Fine',
    content: (
      <div className="space-y-4">
        <p>You don&apos;t need to fill the card.</p>
        <p>
          Three sincere sentences beat three paragraphs of filler. If you&apos;ve said what you
          feel, you&apos;re done.
        </p>
        <div className="mt-4 rounded bg-neutral-100 p-3 text-sm">
          <p>
            &ldquo;Mom — I know I don&apos;t say it enough. Thank you for everything. I love
            you.&rdquo;
          </p>
          <p className="mt-2 text-xs text-neutral-500">That&apos;s it. That&apos;s the card.</p>
        </div>
      </div>
    ),
    backContent: (
      <div className="space-y-4">
        <p className="italic text-neutral-500">Length is not love. Meaning is.</p>
      </div>
    ),
  },
  {
    pageNumber: 6,
    title: 'Let Us Help',
    content: (
      <div className="space-y-4">
        <p>Staring at a blank card? That&apos;s why we built this.</p>
        <p>
          Tell us about them — who they are, what the occasion is, the vibe you&apos;re going for.
          We&apos;ll help you find the words.
        </p>
        <p className="mt-4 font-medium">
          Because the message should sound like you. We just help you get there.
        </p>
      </div>
    ),
    backContent: (
      <div className="flex h-full flex-col items-center justify-center space-y-4">
        <p className="text-center text-neutral-600">
          Ready to write a card that actually sounds like you?
        </p>
        <a
          href="/create"
          className="rounded-full bg-neutral-800 px-4 py-2 text-sm text-white transition-colors hover:bg-neutral-700"
        >
          Browse Cards
        </a>
      </div>
    ),
  },
];

const email = 'hello@anydaycard.com';

export default function About() {
  return (
    <div>
      <Header />
      <ViewCounter pathname="/about" />
      <MousePositionVarsSetter />
      <div className="glow pointer-events-none fixed h-[400px] w-[400px] rounded-full blur-3xl" />

      <div className="flex flex-col px-5 py-5 md:py-8">
        <main className="pb-12">
          {/* Bento Grid Section */}
          <section className="mb-12">
            <h1 className="mb-6 font-archivo text-4xl lg:text-8xl">
              Cards that sound like you.<br />
              Made with a little help.
            </h1>
            <div className="mb-10">
              <p className="text-lg text-text-secondary">Skip the blank card panic. Answer a few questions and we'll craft the perfect message, you take the credit.</p>
              <p className="mt-2 text-lg font-medium text-text-primary">Real cards. Real paper. Hand Delivered.</p>
            </div>
            <div className="home-cards">
              {getCards({ sketchbookCard: true }).map(({ gridArea, Component }, i) => (
                <div key={i} style={{ gridArea }}>
                  <Component currentCount={0} metrics={{}} />
                </div>
              ))}
            </div>
          </section>

          {/* Interactive Book Section */}
          <section className="mb-12 flex flex-col items-center">
            <h2 className="mb-2 text-center font-archivo text-2xl lg:text-4xl">
              How to Write Cards That Sound Like You
            </h2>
            <p className="mb-8 text-center text-text-secondary">
              Our philosophy on card writing — because the best cards come from the heart.
            </p>
            <InteractiveBook
              coverImage="https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&h=600&fit=crop&q=80"
              bookTitle="How to Write Cards That Sound Like You"
              bookAuthor="anydaycard"
              pages={bookPages}
              width={320}
              height={450}
              hintText="Flip around"
            />
          </section>

          {/* Contact Section */}
          <section className="flex flex-col items-center">
            <h2 className="mb-4 font-archivo text-2xl lg:text-4xl">Get in touch</h2>
            <div className="mb-8 flex flex-col items-center gap-6 text-center md:flex-row">
              <a
                href="mailto:hello@anydaycard.com"
                className="rounded-lg font-archivo text-[clamp(2.25rem,2vw+1rem,3.75rem)]"
              >
                hello@anydaycard.com
              </a>
            </div>

            <div className="flex flex-wrap justify-center gap-1">
              <CopyToClipboard content={email} label="Copy email" />
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
