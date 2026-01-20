import { Metadata } from 'next';

import CopyToClipboard from '~/src/components/CopyToClipboard';
import Button from '~/src/components/ui/Button';
import ViewLogger from '~/src/components/ViewCounter';

import Header from '../components/Header';
import CardGuideBook from './CardGuideBook';

const links: { label: string; href: string }[] = [];

const email = 'hello@anydaycard.com';

export const metadata: Metadata = {
  title: 'About | anydaycard',
  description: 'Learn how to write cards that actually sound like you.',
};

export default function About() {
  return (
    <>
      <Header />
      <ViewLogger pathname="/about" />
      <main className="flex flex-1 flex-col px-11 py-8">
        <div className="flex flex-col items-center justify-center gap-16 text-text-primary">
          {/* Interactive Book Guide */}
          <section className="flex flex-col items-center">
            <CardGuideBook />
          </section>

          {/* Contact Section */}
          <section className="flex flex-col items-center">
            <h1 className="mb-4">Get in touch</h1>
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
              {links.map(({ label, ...rest }) => {
                const linkProps = { ...rest, target: '_blank', rel: 'noopener noreferrer' };
                return (
                  <Button key={label} asChild>
                    <a {...linkProps}>{label}</a>
                  </Button>
                );
              })}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
