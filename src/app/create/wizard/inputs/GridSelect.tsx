'use client';

import { motion } from 'framer-motion';

import { cn } from '~/src/util';

import type { QuestionOption } from '../questions';

type Props<T extends string> = {
  options: QuestionOption<T>[];
  value: T | null;
  onChange: (value: T) => void;
  columns?: 2 | 3;
  className?: string;
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { opacity: 1, scale: 1 },
};

export default function GridSelect<T extends string>({
  options,
  value,
  onChange,
  columns = 3,
  className,
}: Props<T>) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className={cn(
        'grid gap-2',
        columns === 3 ? 'grid-cols-3' : 'grid-cols-2',
        className
      )}
    >
      {options.map((option) => {
        const isSelected = value === option.value;
        return (
          <motion.button
            key={option.value}
            type="button"
            variants={itemVariants}
            onClick={() => onChange(option.value)}
            className={cn(
              'flex flex-col items-center justify-center gap-1 rounded-xl border px-3 py-4 transition-all',
              'focus:outline-none focus:ring-2 focus:ring-stone-400 focus:ring-offset-2',
              isSelected
                ? 'border-stone-800 bg-stone-800 text-white'
                : 'border-stone-200 bg-white text-stone-700 hover:border-stone-400 hover:bg-stone-50'
            )}
          >
            {option.emoji && (
              <span className="text-2xl" role="img" aria-hidden>
                {option.emoji}
              </span>
            )}
            <span className="text-center text-sm font-medium leading-tight">
              {option.label}
            </span>
          </motion.button>
        );
      })}
    </motion.div>
  );
}
