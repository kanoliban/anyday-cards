'use client';

import { motion } from 'framer-motion';

import { FEATURES } from './constants';

export function Features() {
  return (
    <section
      id="features"
      className="relative z-10 overflow-hidden bg-theme-4 py-24 text-text-contrast"
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

        {/* Right content - Card previews */}
        <motion.div
          className="relative lg:w-1/2"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <div className="relative grid grid-cols-2 gap-4">
            {/* Card 1 - Birthday theme */}
            <motion.div
              initial={{ y: 20 }}
              whileInView={{ y: 32 }}
              viewport={{ once: true }}
              className="translate-y-8 overflow-hidden rounded-xl border border-white/20 bg-white/5 shadow-lg"
            >
              <div className="aspect-[4/5] overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1558636508-e0db3814bd1d?q=80&w=600&auto=format&fit=crop"
                  alt="Birthday celebration card"
                  className="size-full object-cover"
                />
              </div>
              <div className="p-4">
                <p className="text-sm font-medium text-white/90">Birthday Wishes</p>
                <p className="mt-1 text-xs text-white/50">AI-personalized message</p>
              </div>
            </motion.div>

            {/* Card 2 - Thank you theme */}
            <div className="overflow-hidden rounded-xl border border-white/20 bg-white/5 shadow-lg">
              <div className="aspect-[4/5] overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=600&auto=format&fit=crop"
                  alt="Thank you card with flowers"
                  className="size-full object-cover"
                />
              </div>
              <div className="p-4">
                <p className="text-sm font-medium text-white/90">Thank You</p>
                <p className="mt-1 text-xs text-white/50">Heartfelt gratitude</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
