'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import useScroll from '~/src/hooks/useScroll';

import './FloatingNav.css';

import { ArrowRightIcon } from '~/src/components/icons';
import { cn } from '~/src/util';

const links = {
  '/': { label: 'Home Page', width: 6.5 },
  '/create/wizard': { label: 'Card Wizard', width: 8.5 },
  '/create': { label: 'Card Canvas', width: 8.5 },
  '/card': { label: 'Card Gallery', width: 7.5 },
  '/about': { label: 'About Us', width: 5.5 },
};

export default function Navabar() {
  const pathname = usePathname();
  const activePath = (Object.keys(links) as Array<keyof typeof links>)
    .filter((path) => pathname === path || (path !== '/' && pathname.startsWith(`${path}/`)))
    .sort((a, b) => String(b).length - String(a).length)[0] ?? '/';
  const activeIndex = Object.keys(links).findIndex((path) => activePath === path);
  const { y } = useScroll();

  const highlightOffset = `${
    0.1875 +
    Object.values(links)
      .slice(0, activeIndex)
      .reduce((acc, curr) => acc + curr.width + 0.5, 0)
  }rem`;

  return (
    <>
      <nav className="border-panel-border bg-panel-background shadow-card relative z-1 flex items-center gap-2 rounded-full border p-1">
        {/* note: motion.div layoutId loses position after page scrolls */}
        <div
          className="bg-theme-3 absolute h-[90%] rounded-full transition-all duration-300 ease-out"
          style={{
            width: `${links[activePath]?.width}rem`,
            left: highlightOffset,
          }}
        />
        {Object.entries(links).map(([path, l], i) => (
          <Link
            href={path}
            key={l.label}
            className="text-text-primary z-1 rounded-full px-4 py-1 text-sm"
          >
            {l.label}
          </Link>
        ))}
      </nav>
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Scroll to top"
        className={cn(
          'anchor-top absolute top-1/2 -translate-y-1/2 rounded-full transition-all duration-300',
          {
            'right-0 opacity-0': y < 50,
            'xs:-right-10 xs:top-1/2 -top-6 right-0': y > 50,
          },
        )}
      >
        <span className="bg-theme-3 relative z-1 flex h-8 w-8 items-center justify-end rounded-full px-2">
          <ArrowRightIcon className="text-text-primary h-6 w-6 -rotate-90" />
        </span>
      </button>
    </>
  );
}
