'use client';

import { motion } from 'framer-motion';

import { FEATURES } from './constants';

export function Features() {
  return (
    <section
      id="features"
      className="overflow-hidden bg-theme-4 py-24 text-text-contrast"
    >
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-16 px-6 lg:flex-row">
        {/* Left content */}
        <div className="lg:w-1/2">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-6 font-archivo text-4xl font-bold"
          >
            Never worry about
            <br />
            writer&apos;s block again.
          </motion.h2>

          <div className="space-y-8">
            {FEATURES.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex gap-4"
                >
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-theme-1/20 text-theme-1">
                    <Icon size={24} weight="duotone" />
                  </div>
                  <div>
                    <h3 className="mb-2 text-xl font-bold">{feature.title}</h3>
                    <p className="leading-relaxed text-text-contrast/70">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Right content - Abstract cards */}
        <motion.div
          className="relative lg:w-1/2"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          {/* Abstract card mockups - sharp definition */}
          <div className="relative grid grid-cols-2 gap-4">
            <motion.div
              initial={{ y: 20 }}
              whileInView={{ y: 32 }}
              viewport={{ once: true }}
              className="translate-y-8 rounded-xl border border-white/20 bg-white/5 p-4 shadow-lg"
            >
              <div className="mb-4 h-4 w-20 rounded bg-white/25" />
              <div className="mb-2 h-3 w-full rounded bg-white/15" />
              <div className="mb-2 h-3 w-3/4 rounded bg-white/15" />
              <div className="mb-2 h-3 w-full rounded bg-white/15" />
              <div className="mt-4 aspect-square rounded-lg border border-white/10 bg-white/5" />
            </motion.div>

            <div className="rounded-xl border border-white/20 bg-white/5 p-4 shadow-lg">
              <div className="mb-4 aspect-square rounded-lg border border-white/10 bg-white/5" />
              <div className="mb-4 h-4 w-20 rounded bg-white/25" />
              <div className="mb-2 h-3 w-full rounded bg-white/15" />
              <div className="mb-2 h-3 w-1/2 rounded bg-white/15" />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
