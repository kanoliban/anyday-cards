'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useMemo } from 'react';

import { cn } from '~/src/util';

import { cards } from '../constants';
import type { WizardAnswers } from '../models';
import { useCardStore } from '../store';
import {
  calculateProgress,
  getNextStep,
  getPrevStep,
  questions,
  type QuestionOption,
} from './questions';

function WizardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const cardId = searchParams.get('card');

  const card = useMemo(() => cards.find((c) => c.id === cardId), [cardId]);

  const wizardStep = useCardStore((s) => s.wizardStep);
  const wizardAnswers = useCardStore((s) => s.wizardAnswers);
  const setWizardStep = useCardStore((s) => s.setWizardStep);
  const setWizardAnswer = useCardStore((s) => s.setWizardAnswer);
  const startWizard = useCardStore((s) => s.startWizard);
  const resetWizard = useCardStore((s) => s.resetWizard);

  // Initialize wizard on mount
  useEffect(() => {
    startWizard();
    return () => resetWizard();
  }, [startWizard, resetWizard]);

  const currentQuestion = useMemo(
    () => questions.find((q) => q.step === wizardStep),
    [wizardStep]
  );

  // Resolve options dynamically (filters based on previous answers)
  const resolvedOptions = currentQuestion?.getOptions
    ? currentQuestion.getOptions(wizardAnswers)
    : currentQuestion?.options;

  const progress = useMemo(
    () => calculateProgress(wizardStep, wizardAnswers),
    [wizardStep, wizardAnswers]
  );

  const canGoBack = useMemo(
    () => getPrevStep(wizardStep, wizardAnswers) !== null,
    [wizardStep, wizardAnswers]
  );

  const canGoNext = useMemo(() => {
    if (!currentQuestion) return wizardStep === 'preview';

    const answer = wizardAnswers[currentQuestion.id as keyof WizardAnswers];

    if (!currentQuestion.required) return true;

    if (Array.isArray(answer)) {
      return answer.length > 0;
    }

    return answer !== undefined && answer !== '';
  }, [currentQuestion, wizardAnswers, wizardStep]);

  const handleBack = useCallback(() => {
    const prevStep = getPrevStep(wizardStep, wizardAnswers);
    if (prevStep) {
      setWizardStep(prevStep);
    } else {
      // Go back to card gallery
      router.back();
    }
  }, [wizardStep, wizardAnswers, setWizardStep, router]);

  const handleNext = useCallback(() => {
    const nextStep = getNextStep(wizardStep, wizardAnswers);
    if (nextStep) {
      setWizardStep(nextStep);
    }
  }, [wizardStep, wizardAnswers, setWizardStep]);

  // Auto-advance on single-select grid questions
  const handleGridSelect = useCallback(
    (value: string) => {
      if (!currentQuestion) return;
      setWizardAnswer(currentQuestion.id as keyof WizardAnswers, value);
      // Auto-advance after brief delay
      setTimeout(() => {
        const nextStep = getNextStep(wizardStep, { ...wizardAnswers, [currentQuestion.id]: value });
        if (nextStep) {
          setWizardStep(nextStep);
        }
      }, 200);
    },
    [currentQuestion, wizardStep, wizardAnswers, setWizardAnswer, setWizardStep]
  );

  const handleMultiSelect = useCallback(
    (value: string) => {
      if (!currentQuestion) return;
      const current = (wizardAnswers[currentQuestion.id as keyof WizardAnswers] as string[]) ?? [];
      const maxSelect = currentQuestion.maxSelect ?? Infinity;

      let newValue: string[];
      if (current.includes(value)) {
        newValue = current.filter((v) => v !== value);
      } else if (current.length < maxSelect) {
        newValue = [...current, value];
      } else {
        return;
      }

      setWizardAnswer(currentQuestion.id as keyof WizardAnswers, newValue);
    },
    [currentQuestion, wizardAnswers, setWizardAnswer]
  );

  const handleChipSelect = useCallback(
    (value: string) => {
      if (!currentQuestion) return;
      const current = (wizardAnswers[currentQuestion.id as keyof WizardAnswers] as string[]) ?? [];

      const newValue = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];

      setWizardAnswer(currentQuestion.id as keyof WizardAnswers, newValue);
    },
    [currentQuestion, wizardAnswers, setWizardAnswer]
  );

  const handleTextChange = useCallback(
    (value: string) => {
      if (!currentQuestion) return;
      setWizardAnswer(currentQuestion.id as keyof WizardAnswers, value);
    },
    [currentQuestion, setWizardAnswer]
  );

  const handleTextSubmit = useCallback(() => {
    if (canGoNext) {
      handleNext();
    }
  }, [canGoNext, handleNext]);

  // Preview step - redirect to generate
  if (wizardStep === 'preview') {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-stone-50 p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="mb-6 text-6xl">✨</div>
          <h1 className="mb-3 text-3xl font-medium text-stone-800">
            Let&apos;s write your message
          </h1>
          <p className="mb-8 max-w-md text-lg text-stone-600">
            Based on what you told us, we&apos;ll craft something that sounds like you.
          </p>
          <button
            onClick={handleBack}
            className="text-stone-500 hover:text-stone-700"
          >
            ← Go back and change something
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col bg-stone-50">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between bg-stone-50/95 px-4 py-4 backdrop-blur-sm sm:px-6">
        <button
          onClick={handleBack}
          className="flex size-10 items-center justify-center rounded-full text-stone-500 transition-colors hover:bg-stone-200 hover:text-stone-700"
        >
          <ArrowLeft className="size-5" />
        </button>

        {/* Progress bar */}
        <div className="mx-4 h-1.5 flex-1 overflow-hidden rounded-full bg-stone-200 sm:mx-8">
          <motion.div
            className="h-full bg-stone-700"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        <div className="w-10" /> {/* Spacer for symmetry */}
      </header>

      {/* Content */}
      <main className="flex flex-1 flex-col items-center justify-center px-4 pb-24 pt-8 sm:px-6">
        <AnimatePresence mode="wait">
          {currentQuestion && (
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.25 }}
              className="flex w-full max-w-2xl flex-col items-center"
            >
              {/* Question */}
              <div className="mb-10 text-center">
                <h1 className="text-3xl font-medium text-stone-800 sm:text-4xl">
                  {currentQuestion.title}
                </h1>
                {currentQuestion.subtitle && (
                  <p className="mt-3 text-lg text-stone-500">
                    {currentQuestion.subtitle}
                  </p>
                )}
              </div>

              {/* Input */}
              <div className="w-full">
                {currentQuestion.type === 'text' && (
                  <div className="mx-auto max-w-md">
                    <input
                      type="text"
                      value={(wizardAnswers[currentQuestion.id as keyof WizardAnswers] as string) ?? ''}
                      onChange={(e) => handleTextChange(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleTextSubmit()}
                      placeholder={currentQuestion.placeholder}
                      autoFocus
                      className="w-full border-b-2 border-stone-300 bg-transparent py-4 text-center text-2xl text-stone-800 placeholder:text-stone-400 focus:border-stone-700 focus:outline-none"
                    />
                    <button
                      onClick={handleNext}
                      disabled={!canGoNext}
                      className={cn(
                        'mt-8 w-full rounded-full py-4 text-lg font-medium transition-all',
                        canGoNext
                          ? 'bg-stone-800 text-white hover:bg-stone-700'
                          : 'cursor-not-allowed bg-stone-200 text-stone-400'
                      )}
                    >
                      Continue
                    </button>
                  </div>
                )}

                {currentQuestion.type === 'grid' && (
                  <motion.div
                    initial="hidden"
                    animate="show"
                    variants={{
                      hidden: { opacity: 0 },
                      show: { opacity: 1, transition: { staggerChildren: 0.03 } },
                    }}
                    className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
                  >
                    {(resolvedOptions as QuestionOption<string>[])?.map((option) => {
                      const isSelected =
                        wizardAnswers[currentQuestion.id as keyof WizardAnswers] === option.value;
                      return (
                        <motion.button
                          key={option.value}
                          type="button"
                          variants={{
                            hidden: { opacity: 0, scale: 0.95 },
                            show: { opacity: 1, scale: 1 },
                          }}
                          onClick={() => handleGridSelect(option.value)}
                          className={cn(
                            'flex flex-col items-center justify-center gap-2 rounded-2xl border-2 px-4 py-6 transition-all',
                            'focus:outline-none focus:ring-2 focus:ring-stone-400 focus:ring-offset-2',
                            isSelected
                              ? 'border-stone-800 bg-stone-800 text-white'
                              : 'border-stone-200 bg-white text-stone-700 hover:border-stone-400 hover:bg-stone-50'
                          )}
                        >
                          {option.emoji && (
                            <span className="text-4xl" role="img" aria-hidden>
                              {option.emoji}
                            </span>
                          )}
                          <span className="text-center text-sm font-medium leading-tight sm:text-base">
                            {option.label}
                          </span>
                        </motion.button>
                      );
                    })}
                  </motion.div>
                )}

                {currentQuestion.type === 'multiSelect' && (
                  <>
                    <motion.div
                      initial="hidden"
                      animate="show"
                      variants={{
                        hidden: { opacity: 0 },
                        show: { opacity: 1, transition: { staggerChildren: 0.03 } },
                      }}
                      className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
                    >
                      {(resolvedOptions as QuestionOption<string>[])?.map((option) => {
                        const selected =
                          (wizardAnswers[currentQuestion.id as keyof WizardAnswers] as string[]) ?? [];
                        const isSelected = selected.includes(option.value);
                        return (
                          <motion.button
                            key={option.value}
                            type="button"
                            variants={{
                              hidden: { opacity: 0, scale: 0.95 },
                              show: { opacity: 1, scale: 1 },
                            }}
                            onClick={() => handleMultiSelect(option.value)}
                            className={cn(
                              'flex flex-col items-center justify-center gap-2 rounded-2xl border-2 px-4 py-6 transition-all',
                              'focus:outline-none focus:ring-2 focus:ring-stone-400 focus:ring-offset-2',
                              isSelected
                                ? 'border-stone-800 bg-stone-800 text-white'
                                : 'border-stone-200 bg-white text-stone-700 hover:border-stone-400 hover:bg-stone-50'
                            )}
                          >
                            {option.emoji && (
                              <span className="text-4xl" role="img" aria-hidden>
                                {option.emoji}
                              </span>
                            )}
                            <span className="text-center text-sm font-medium leading-tight sm:text-base">
                              {option.label}
                            </span>
                          </motion.button>
                        );
                      })}
                    </motion.div>
                    <button
                      onClick={handleNext}
                      disabled={!canGoNext}
                      className={cn(
                        'mx-auto mt-8 block w-full max-w-md rounded-full py-4 text-lg font-medium transition-all',
                        canGoNext
                          ? 'bg-stone-800 text-white hover:bg-stone-700'
                          : 'cursor-not-allowed bg-stone-200 text-stone-400'
                      )}
                    >
                      Continue
                    </button>
                  </>
                )}

                {currentQuestion.type === 'list' && (
                  <motion.div
                    initial="hidden"
                    animate="show"
                    variants={{
                      hidden: { opacity: 0 },
                      show: { opacity: 1, transition: { staggerChildren: 0.04 } },
                    }}
                    className="mx-auto flex max-w-lg flex-col gap-3"
                  >
                    {(resolvedOptions as QuestionOption<string>[])?.map((option) => {
                      const isSelected =
                        wizardAnswers[currentQuestion.id as keyof WizardAnswers] === option.value;
                      return (
                        <motion.button
                          key={option.value}
                          type="button"
                          variants={{
                            hidden: { opacity: 0, x: -10 },
                            show: { opacity: 1, x: 0 },
                          }}
                          onClick={() => handleGridSelect(option.value)}
                          className={cn(
                            'rounded-xl border-2 px-6 py-4 text-left transition-all',
                            'focus:outline-none focus:ring-2 focus:ring-stone-400 focus:ring-offset-2',
                            isSelected
                              ? 'border-stone-800 bg-stone-800 text-white'
                              : 'border-stone-200 bg-white text-stone-700 hover:border-stone-400 hover:bg-stone-50'
                          )}
                        >
                          <span className="font-medium">{option.label}</span>
                        </motion.button>
                      );
                    })}
                  </motion.div>
                )}

                {currentQuestion.type === 'chips' && (
                  <>
                    <motion.div
                      initial="hidden"
                      animate="show"
                      variants={{
                        hidden: { opacity: 0 },
                        show: { opacity: 1, transition: { staggerChildren: 0.02 } },
                      }}
                      className="flex flex-wrap justify-center gap-2"
                    >
                      {(resolvedOptions as QuestionOption<string>[])?.map((option) => {
                        const selected =
                          (wizardAnswers[currentQuestion.id as keyof WizardAnswers] as string[]) ?? [];
                        const isSelected = selected.includes(option.value);
                        return (
                          <motion.button
                            key={option.value}
                            type="button"
                            variants={{
                              hidden: { opacity: 0, scale: 0.9 },
                              show: { opacity: 1, scale: 1 },
                            }}
                            onClick={() => handleChipSelect(option.value)}
                            className={cn(
                              'flex items-center gap-2 rounded-full border px-4 py-2 transition-all',
                              'focus:outline-none focus:ring-2 focus:ring-stone-400 focus:ring-offset-2',
                              isSelected
                                ? 'border-stone-800 bg-stone-800 text-white'
                                : 'border-stone-300 bg-white text-stone-700 hover:border-stone-400 hover:bg-stone-50'
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
                    <button
                      onClick={handleNext}
                      className="mx-auto mt-8 block w-full max-w-md rounded-full bg-stone-800 py-4 text-lg font-medium text-white transition-all hover:bg-stone-700"
                    >
                      {canGoNext ? 'Continue' : 'Skip'}
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default function WizardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center bg-stone-50">
          <div className="size-8 animate-spin rounded-full border-2 border-stone-300 border-t-stone-800" />
        </div>
      }
    >
      <WizardContent />
    </Suspense>
  );
}
