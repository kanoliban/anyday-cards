'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';
import { useCallback, useMemo } from 'react';

import { cn } from '~/src/util';

import type { WizardAnswers } from '../models';
import { useCardStore } from '../store';
import { ChipSelect, GridSelect, ListSelect, MultiSelect, TextInput } from './inputs';
import {
  calculateProgress,
  getNextStep,
  getPrevStep,
  questions,
  type QuestionOption,
} from './questions';

type Props = {
  className?: string;
};

export default function WizardShell({ className }: Props) {
  const wizardStep = useCardStore((s) => s.wizardStep);
  const wizardAnswers = useCardStore((s) => s.wizardAnswers);
  const setWizardStep = useCardStore((s) => s.setWizardStep);
  const setWizardAnswer = useCardStore((s) => s.setWizardAnswer);
  const resetWizard = useCardStore((s) => s.resetWizard);

  const currentQuestion = useMemo(
    () => questions.find((q) => q.step === wizardStep),
    [wizardStep]
  );

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
    }
  }, [wizardStep, wizardAnswers, setWizardStep]);

  const handleNext = useCallback(() => {
    const nextStep = getNextStep(wizardStep, wizardAnswers);
    if (nextStep) {
      setWizardStep(nextStep);
    }
  }, [wizardStep, wizardAnswers, setWizardStep]);

  const handleClose = useCallback(() => {
    resetWizard();
  }, [resetWizard]);

  const renderInput = useCallback(() => {
    if (!currentQuestion) return null;

    const answer = wizardAnswers[currentQuestion.id as keyof WizardAnswers];

    switch (currentQuestion.type) {
      case 'text':
        return (
          <TextInput
            value={(answer as string) ?? ''}
            onChange={(value) =>
              setWizardAnswer(currentQuestion.id as keyof WizardAnswers, value)
            }
            placeholder={currentQuestion.placeholder}
            autoFocus
          />
        );

      case 'grid':
        return (
          <GridSelect
            options={currentQuestion.options as QuestionOption<string>[]}
            value={(answer as string) ?? null}
            onChange={(value) =>
              setWizardAnswer(currentQuestion.id as keyof WizardAnswers, value)
            }
            columns={currentQuestion.options && currentQuestion.options.length > 6 ? 3 : 2}
          />
        );

      case 'multiSelect':
        return (
          <MultiSelect
            options={currentQuestion.options as QuestionOption<string>[]}
            value={(answer as string[]) ?? []}
            onChange={(value) =>
              setWizardAnswer(currentQuestion.id as keyof WizardAnswers, value)
            }
            maxSelect={currentQuestion.maxSelect}
          />
        );

      case 'list':
        return (
          <ListSelect
            options={currentQuestion.options as QuestionOption<string>[]}
            value={(answer as string) ?? null}
            onChange={(value) =>
              setWizardAnswer(currentQuestion.id as keyof WizardAnswers, value)
            }
          />
        );

      case 'chips':
        return (
          <ChipSelect
            options={currentQuestion.options as QuestionOption<string>[]}
            value={(answer as string[]) ?? []}
            onChange={(value) =>
              setWizardAnswer(currentQuestion.id as keyof WizardAnswers, value)
            }
          />
        );

      default:
        return null;
    }
  }, [currentQuestion, wizardAnswers, setWizardAnswer]);

  // Preview step
  if (wizardStep === 'preview') {
    return (
      <div className={cn('flex flex-col gap-6', className)}>
        <div className="flex items-center justify-between">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-sm text-stone-600 hover:text-stone-800"
          >
            <ArrowLeft className="size-4" />
            Back
          </button>
          <button
            onClick={handleClose}
            className="flex items-center justify-center rounded-full p-2 text-stone-500 hover:bg-stone-200 hover:text-stone-700"
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-medium text-stone-800">Ready to generate!</h2>
          <p className="mt-2 text-stone-600">
            Review your answers and generate a personalized message.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col gap-6', className)}>
      {/* Header with progress */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {canGoBack && (
            <button
              onClick={handleBack}
              className="flex items-center justify-center rounded-full p-2 text-stone-500 hover:bg-stone-200 hover:text-stone-700"
            >
              <ArrowLeft className="size-5" />
            </button>
          )}
          <span className="text-sm font-medium text-stone-600">{progress}% personalized</span>
        </div>
        <button
          onClick={handleClose}
          className="flex items-center justify-center rounded-full p-2 text-stone-500 hover:bg-stone-200 hover:text-stone-700"
        >
          <X className="size-5" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-1 w-full overflow-hidden rounded-full bg-stone-200">
        <motion.div
          className="h-full bg-stone-700"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Question content */}
      <AnimatePresence mode="wait">
        {currentQuestion && (
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-6"
          >
            <div>
              <h2 className="text-xl font-medium text-stone-800">{currentQuestion.title}</h2>
              {currentQuestion.subtitle && (
                <p className="mt-1 text-sm text-stone-500">{currentQuestion.subtitle}</p>
              )}
            </div>

            {renderInput()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <div className="mt-auto flex items-center justify-between pt-4">
        {!currentQuestion?.required && (
          <button
            onClick={handleNext}
            className="text-sm text-stone-500 hover:text-stone-700"
          >
            Skip
          </button>
        )}
        <div className="ml-auto">
          <button
            onClick={handleNext}
            disabled={!canGoNext}
            className={cn(
              'flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all',
              canGoNext
                ? 'bg-stone-800 text-white hover:bg-stone-700'
                : 'cursor-not-allowed bg-stone-200 text-stone-400'
            )}
          >
            Continue
            <ArrowRight className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
