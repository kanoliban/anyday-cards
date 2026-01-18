'use client';

import { motion } from 'framer-motion';

import { cn } from '~/src/util';

import type { QuestionOption } from '../questions';

type Props<T extends string> = {
  options: QuestionOption<T>[];
  value: T[];
  onChange: (value: T[]) => void;
  maxSelect?: number;
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

export default function MultiSelect<T extends string>({
  options,
  value,
  onChange,
  maxSelect,
  className,
}: Props<T>) {
  function handleToggle(optionValue: T) {
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue));
    } else if (!maxSelect || value.length < maxSelect) {
      onChange([...value, optionValue]);
    }
  }

  const isAtMax = maxSelect !== undefined && value.length >= maxSelect;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className={cn('flex flex-wrap gap-2', className)}
    >
      {options.map((option) => {
        const isSelected = value.includes(option.value);
        const isDisabled = !isSelected && isAtMax;

        return (
          <motion.button
            key={option.value}
            type="button"
            variants={itemVariants}
            onClick={() => handleToggle(option.value)}
            disabled={isDisabled}
            className={cn(
              'flex items-center gap-2 rounded-full border px-4 py-2 transition-all',
              'focus:outline-none focus:ring-2 focus:ring-stone-400 focus:ring-offset-2',
              isSelected
                ? 'border-stone-800 bg-stone-800 text-white'
                : isDisabled
                  ? 'cursor-not-allowed border-stone-200 bg-stone-100 text-stone-400'
                  : 'border-stone-200 bg-white text-stone-700 hover:border-stone-400 hover:bg-stone-50'
            )}
          >
            {option.emoji && (
              <span className="text-lg" role="img" aria-hidden>
                {option.emoji}
              </span>
            )}
            <span className="text-sm font-medium">{option.label}</span>
          </motion.button>
        );
      })}
    </motion.div>
  );
}
