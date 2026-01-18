'use client';

import { motion } from 'framer-motion';

import { cn } from '~/src/util';

import type { QuestionOption } from '../questions';

type Props<T extends string> = {
  options: QuestionOption<T>[];
  value: T[];
  onChange: (value: T[]) => void;
  className?: string;
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.02,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  show: { opacity: 1, scale: 1 },
};

export default function ChipSelect<T extends string>({
  options,
  value,
  onChange,
  className,
}: Props<T>) {
  function handleToggle(optionValue: T) {
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className={cn('flex flex-wrap gap-2', className)}
    >
      {options.map((option) => {
        const isSelected = value.includes(option.value);

        return (
          <motion.button
            key={option.value}
            type="button"
            variants={itemVariants}
            onClick={() => handleToggle(option.value)}
            className={cn(
              'flex items-center gap-1.5 rounded-full border px-3 py-1.5 transition-all',
              'focus:outline-none focus:ring-2 focus:ring-stone-400 focus:ring-offset-2',
              isSelected
                ? 'border-stone-700 bg-stone-700 text-white'
                : 'border-stone-300 bg-white text-stone-600 hover:border-stone-400 hover:bg-stone-50'
            )}
          >
            {option.emoji && (
              <span className="text-sm" role="img" aria-hidden>
                {option.emoji}
              </span>
            )}
            <span className="text-xs font-medium">{option.label}</span>
          </motion.button>
        );
      })}
    </motion.div>
  );
}
