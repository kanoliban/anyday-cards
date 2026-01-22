'use client';

import { motion } from 'framer-motion';

import { STEPS } from './constants';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function HowItWorks() {
  return (
    <section id="how-it-works" className="px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="mb-4 font-archivo text-4xl font-bold text-text-primary">
            How It Works
          </h2>
          <p className="mx-auto max-w-2xl text-xl text-text-secondary">
            We&apos;ve simplified the process of sending a meaningful card down
            to just a few clicks.
          </p>
        </motion.div>

        <motion.div
          className="grid gap-8 md:grid-cols-3 md:gap-12"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={i}
                variants={item}
                className="texture-grain edge-highlight group relative rounded-2xl border border-black/10 bg-panel-background p-8 shadow-premium transition-shadow hover:shadow-xl"
              >
                <div className="mb-6 flex size-16 items-center justify-center rounded-2xl bg-theme-3 text-theme-1 transition-transform group-hover:scale-110">
                  <Icon size={32} weight="duotone" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-text-primary">
                  {i + 1}. {step.title}
                </h3>
                <p className="leading-relaxed text-text-secondary">
                  {step.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
