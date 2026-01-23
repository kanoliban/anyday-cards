'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Sparkle, CheckCircle } from '@phosphor-icons/react';
import { Star } from '@phosphor-icons/react/dist/ssr';

import Button from '~/src/components/ui/Button';

export function Hero() {
  return (
    <section className="relative px-6 pb-20 pt-32 lg:pb-32 lg:pt-48">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-12 lg:flex-row lg:gap-20">
        {/* Left content */}
        <div className="text-center lg:w-1/2 lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-theme-1/20 bg-theme-3 px-4 py-2 text-sm font-semibold text-theme-1"
          >
            <Sparkle size={16} weight="fill" />
            The AI Greeting Card Platform
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-archivo text-5xl font-bold leading-[1.1] tracking-tight text-text-primary lg:text-7xl"
          >
            Send Cards That{' '}
            <span className="italic text-theme-1">Sound Like You,</span> Made in
            Minutes
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto mb-10 mt-8 max-w-xl text-xl leading-relaxed text-text-secondary lg:mx-0"
          >
            Turn your specific memories and inside jokes into a one-of-a-kind
            physical card. No login required to start.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col justify-center gap-4 sm:flex-row lg:justify-start"
          >
            <Button
              asChild
              variant="secondary"
              iconRight={<ArrowRight size={20} weight="bold" />}
            >
              <Link href="/create/wizard">Quick Create</Link>
            </Button>
            <Button asChild variant="primary">
              <Link href="/about">Learn more</Link>
            </Button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-6 flex items-center justify-center gap-2 text-sm text-text-muted lg:justify-start"
          >
            <CheckCircle size={16} weight="fill" className="text-green-500" />
            No credit card required to draft
          </motion.p>
        </div>

        {/* Right content - Card preview */}
        <motion.div
          className="relative lg:w-1/2"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          {/* Card - premium with character */}
          <motion.div
            className="texture-grain edge-highlight relative overflow-hidden rounded-2xl border border-black/10 bg-panel-background p-6 shadow-premium"
            initial={{ rotate: 2 }}
            whileHover={{ rotate: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-theme-3">
              <img
                src="https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=1000&auto=format&fit=crop"
                alt="Greeting Card Example"
                className="size-full object-cover"
              />
              <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 to-transparent p-8">
                <p className="font-libertinus text-2xl font-medium leading-snug text-white">
                  "Happy Birthday Sarah! I still remember when we got lost in
                  IKEA..."
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between px-2">
              <span className="text-sm font-medium text-text-primary">
                Premium 100lb Matte Cardstock
              </span>
              <div className="flex text-theme-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} weight="fill" />
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
