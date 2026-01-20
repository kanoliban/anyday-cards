'use client';

import { motion } from 'framer-motion';

import { cn } from '~/src/util';

import type { QuestionOption } from '../questions';

type Props<T extends string> = {
  options: QuestionOption<T>[];
  value: T | null;
  onChange: (value: T) => void;
  className?: string;
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  show: { opacity: 1, x: 0 },
};

export default function ListSelect<T extends string>({
  options,
  value,
  onChange,
  className,
}: Props<T>) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className={cn('flex flex-col gap-2', className)}
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
              'flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all',
              'focus:outline-none focus:ring-2 focus:ring-stone-400 focus:ring-offset-2',
              isSelected
                ? 'border-stone-800 bg-stone-800 text-white'
                : 'border-stone-200 bg-white text-stone-700 hover:border-stone-400 hover:bg-stone-50'
            )}
          >
            <div
              className={cn(
                'flex size-5 items-center justify-center rounded-full border-2 transition-colors',
                isSelected ? 'border-white bg-white' : 'border-stone-300'
              )}
            >
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="size-2.5 rounded-full bg-stone-800"
                />
              )}
            </div>
            <span className="text-sm font-medium">{option.label}</span>
          </motion.button>
        );
      })}
    </motion.div>
  );
}
