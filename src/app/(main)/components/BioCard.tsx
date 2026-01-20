import Link from 'next/link';

import { ArrowRightIcon, InstagramIcon } from '~/src/components/icons';
import Button from '~/src/components/ui/Button';

import Card from './Card';
import MiniCanvas from './MiniCanvas';

import './cards.css';

const social = [
  {
    url: 'https://instagram.com/anydaycard',
    Icon: InstagramIcon,
    attrs: { 'aria-label': 'Follow us on Instagram' },
  },
];

export default function BrandStoryCard() {
  return (
    <Card className="flex flex-1 flex-col gap-2 bg-panel-background">
      <MiniCanvas />

      <p className="text-4xl italic leading-snug text-text-primary">
        Writing the perfect card message is hard. That's where we come in. Tell us about
        them—their humor, what makes them special—and we'll write something that sounds like you
        wrote it, and ship it straight to them.
      </p>
      <div className="mt-4 flex flex-col items-start justify-between text-text-primary md:flex-row md:items-center">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm">Follow our journey on</span>
          <div className="flex gap-2">
            {social.map(({ url, Icon, attrs }) => (
              <a
                target="_blank"
                rel="noreferrer noopener"
                key={url}
                href={`${url}`}
                className="hover cursor-pointer rounded-full transition-all duration-200 text-theme-2 hover:text-theme-1"
                {...attrs}
              >
                <Icon />
              </a>
            ))}
          </div>
        </div>
        <Button className="mt-10 md:mt-0" iconRight={<ArrowRightIcon />} asChild>
          <Link href="/cards">Browse Cards</Link>
        </Button>
      </div>
    </Card>
  );
}

export { BrandStoryCard as BioCard };
