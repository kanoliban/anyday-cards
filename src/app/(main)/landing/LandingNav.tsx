'use client';

import Link from 'next/link';
import { useState } from 'react';
import { List, X, EnvelopeSimple } from '@phosphor-icons/react';

import Button from '~/src/components/ui/Button';
import useScroll from '~/src/hooks/useScroll';
import { cn } from '~/src/util';


const NAV_LINKS = [
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '#pricing' },
];

export function LandingNav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { y } = useScroll();

  const scrollToSection = (href: string) => {
    const id = href.replace('#', '');
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

  return (
    <nav
      className={cn(
        'fixed left-0 right-0 top-0 z-40 border-b transition-all duration-300',
        y > 50
          ? 'border-panel-border bg-panel-background/80 backdrop-blur-md'
          : 'border-transparent bg-transparent'
      )}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <Link
          href="/"
          className="flex cursor-pointer items-center gap-2 font-archivo text-2xl font-bold text-theme-1"
        >
          <EnvelopeSimple size={24} weight="duotone" />
          AnyDayCard
        </Link>

        {/* Desktop Nav */}
        <div className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <button
              key={link.label}
              onClick={() => scrollToSection(link.href)}
              className="font-medium text-text-secondary transition-colors hover:text-theme-1"
            >
              {link.label}
            </button>
          ))}
          <Button asChild variant="secondary" size="sm">
            <Link href="/create/wizard">Create Card</Link>
          </Button>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            className="p-2 text-text-secondary"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {isMenuOpen ? <X size={24} /> : <List size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {isMenuOpen && (
        <div className="absolute w-full border-t border-panel-border bg-panel-background px-6 py-6 shadow-xl md:hidden">
          <div className="flex flex-col gap-4">
            {NAV_LINKS.map((link) => (
              <button
                key={link.label}
                onClick={() => scrollToSection(link.href)}
                className="py-2 text-left font-medium text-text-secondary"
              >
                {link.label}
              </button>
            ))}
            <hr className="border-panel-border" />
            <Button asChild variant="secondary" className="w-full justify-center">
              <Link href="/create/wizard">Create Card</Link>
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}
