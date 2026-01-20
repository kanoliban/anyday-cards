'use client';

import InteractiveBook, { type BookPage } from '~/src/components/ui/interactive-book';

const pages: BookPage[] = [
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
        <p className="text-neutral-500 italic">
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
        <ul className="list-disc pl-5 space-y-2">
          <li>How do I actually feel about this person?</li>
          <li>What&apos;s one specific thing I appreciate?</li>
          <li>What moment comes to mind when I think of them?</li>
        </ul>
        <p className="text-sm text-neutral-500 mt-4">
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
        <div className="bg-neutral-100 p-3 rounded text-sm space-y-2">
          <p>
            <span className="line-through text-neutral-400">
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
        <p>
          Imagine texting them. Write that first. Then clean it up just enough for paper.
        </p>
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
        <div className="bg-neutral-100 p-3 rounded text-sm mt-4">
          <p>&ldquo;Mom — I know I don&apos;t say it enough. Thank you for everything. I love you.&rdquo;</p>
          <p className="text-neutral-500 text-xs mt-2">That&apos;s it. That&apos;s the card.</p>
        </div>
      </div>
    ),
    backContent: (
      <div className="space-y-4">
        <p className="text-neutral-500 italic">
          Length is not love. Meaning is.
        </p>
      </div>
    ),
  },
  {
    pageNumber: 6,
    title: 'Let Us Help',
    content: (
      <div className="space-y-4">
        <p>
          Staring at a blank card? That&apos;s why we built this.
        </p>
        <p>
          Tell us about them — who they are, what the occasion is, the vibe you&apos;re going for.
          We&apos;ll help you find the words.
        </p>
        <p className="font-medium mt-4">
          Because the message should sound like you. We just help you get there.
        </p>
      </div>
    ),
    backContent: (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <p className="text-center text-neutral-600">
          Ready to write a card that actually sounds like you?
        </p>
        <a
          href="/cards"
          className="px-4 py-2 bg-neutral-800 text-white rounded-full text-sm hover:bg-neutral-700 transition-colors"
        >
          Browse Cards
        </a>
      </div>
    ),
  },
];

export default function CardGuideBook() {
  return (
    <InteractiveBook
      coverImage="https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&h=600&fit=crop&q=80"
      bookTitle="How to Write Cards That Sound Like You"
      bookAuthor="anydaycard"
      pages={pages}
      width={320}
      height={450}
    />
  );
}
