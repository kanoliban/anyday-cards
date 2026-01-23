import Link from 'next/link';
import { EnvelopeSimple, TwitterLogo, InstagramLogo } from '@phosphor-icons/react/dist/ssr';

import { FOOTER_LINKS } from './constants';

export function LandingFooter() {
  return (
    <footer className="border-t border-panel-border bg-theme-3/30 px-6 py-12">
      <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-4">
        {/* Brand */}
        <div className="md:col-span-1">
          <Link
            href="/"
            className="mb-4 flex items-center gap-2 font-archivo text-xl font-bold text-theme-1"
          >
            <EnvelopeSimple size={20} weight="duotone" />
            AnyDayCard
          </Link>
          <p className="text-sm text-text-muted">
            Cards that sound like you.
            <br />
            Made with a little help.
          </p>
        </div>

        {/* Links */}
        {Object.entries(FOOTER_LINKS).map(([category, links]) => (
          <div key={category}>
            <h4 className="mb-4 font-bold text-text-primary">{category}</h4>
            <ul className="space-y-2 text-sm text-text-secondary">
              {links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="transition-colors hover:text-theme-1"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Social */}
        <div>
          <h4 className="mb-4 font-bold text-text-primary">Connect</h4>
          <div className="flex gap-4">
            <a
              href="https://twitter.com/anydaycard"
              target="_blank"
              rel="noopener noreferrer"
              className="flex size-8 items-center justify-center rounded-full border border-panel-border bg-panel-background text-text-muted transition-colors hover:border-theme-1 hover:text-theme-1"
              aria-label="Twitter"
            >
              <TwitterLogo size={16} />
            </a>
            <a
              href="https://instagram.com/anydaycard"
              target="_blank"
              rel="noopener noreferrer"
              className="flex size-8 items-center justify-center rounded-full border border-panel-border bg-panel-background text-text-muted transition-colors hover:border-theme-1 hover:text-theme-1"
              aria-label="Instagram"
            >
              <InstagramLogo size={16} />
            </a>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-12 max-w-7xl border-t border-panel-border pt-8 text-center text-sm text-text-muted">
        &copy; {new Date().getFullYear()} AnyDayCard. All rights reserved.
      </div>
    </footer>
  );
}
