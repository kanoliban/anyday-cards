import { Metadata } from 'next';

import CopyToClipboard from '~/src/components/CopyToClipboard';
import Button from '~/src/components/ui/Button';
import ViewLogger from '~/src/components/ViewCounter';

import Header from '../components/Header';

const links: { label: string; href: string }[] = [];

const email = 'hello@anydaycard.com';

export const metadata: Metadata = {
  title: 'Contact | anydaycard',
  description: 'Get in touch with anydaycard.',
};

export default function Contact() {
  return (
    <>
      <Header />
      <ViewLogger pathname="/contact" />
      <main className="flex flex-1 flex-col px-11 py-8">
        <div className="flex flex-1 flex-col items-center justify-center text-text-primary">
          <h1>Get in touch</h1>
          <div className="mb-[100px] flex flex-col items-center gap-6 text-center md:mb-8 md:flex-row ">
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
        </div>
      </main>
    </>
  );
}
