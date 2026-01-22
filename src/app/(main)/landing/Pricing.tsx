'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { CheckCircle } from '@phosphor-icons/react';

import Button from '~/src/components/ui/Button';
import { cn } from '~/src/util';

import { PRICING_TIERS } from './constants';

export function Pricing() {
  return (
    <section id="pricing" className="px-6 py-24 text-center">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="mb-4 font-archivo text-4xl font-bold text-text-primary">
            Simple, Transparent Pricing
          </h2>
          <p className="mb-16 text-xl text-text-secondary">
            Choose what fits how often you send.
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-3">
          {PRICING_TIERS.map((tier, i) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={cn(
                'texture-grain edge-highlight relative overflow-hidden rounded-3xl border bg-panel-background p-8',
                tier.popular
                  ? 'scale-105 border-2 border-theme-1 shadow-xl'
                  : 'border-black/10 shadow-premium'
              )}
            >
              {tier.popular && (
                <div className="absolute right-0 top-0 rounded-bl-lg bg-theme-1 px-3 py-1 text-xs font-bold text-text-contrast">
                  MOST POPULAR
                </div>
              )}

              <h3 className="mb-2 font-bold uppercase tracking-widest text-text-muted">
                {tier.name}
              </h3>

              <div className="mb-6 flex items-baseline justify-center gap-2">
                <span className="text-5xl font-bold text-text-primary">
                  {tier.price}
                </span>
                {tier.period && (
                  <span className="text-text-muted">{tier.period}</span>
                )}
              </div>

              <p className="mb-8 text-text-secondary">{tier.description}</p>

              <ul className="mb-8 space-y-4 text-left">
                {tier.features.map((feature, j) => (
                  <li key={j} className="flex items-center gap-3">
                    <CheckCircle
                      size={20}
                      weight="fill"
                      className="text-theme-1"
                    />
                    <span className="text-text-primary">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                asChild
                variant={tier.popular ? 'secondary' : 'primary'}
                className="w-full"
              >
                <Link href="/create">{tier.cta}</Link>
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
