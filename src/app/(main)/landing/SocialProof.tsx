'use client';

import { motion } from 'framer-motion';

import { SOCIAL_PROOF } from './constants';

export function SocialProof() {
  return (
    <section className="border-y border-panel-border bg-theme-3/30 py-10">
      <div className="mx-auto max-w-7xl px-6 text-center">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-8 text-sm font-bold uppercase tracking-widest text-text-muted"
        >
          Trusted by thoughtful people everywhere
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.5 }}
          whileHover={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-wrap justify-center gap-12 grayscale transition-all duration-500 hover:grayscale-0 lg:gap-20"
        >
          {SOCIAL_PROOF.map((brand) => (
            <span
              key={brand}
              className="font-libertinus text-xl font-bold text-text-primary"
            >
              {brand}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
