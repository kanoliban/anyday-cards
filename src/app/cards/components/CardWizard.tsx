'use client';

import { Sparkles } from 'lucide-react';
import { useState } from 'react';

import Button from '~/src/components/ui/Button';
import { cn } from '~/src/util';

import { useCartStore } from '../../(main)/shop/store';
import type { Card, CardVariant } from '../models';

type WizardStep = 'recipient' | 'message' | 'preview';

type Props = {
  card: Card;
  onComplete?: () => void;
  onBack?: () => void;
};

type FormData = {
  recipientName: string;
  relationship: string;
  occasion: string;
  message: string;
};

const RELATIONSHIPS = [
  'Friend',
  'Parent',
  'Partner',
  'Sibling',
  'Colleague',
  'Child',
  'Grandparent',
  'Other',
];

export default function CardWizard({ card, onComplete, onBack }: Props) {
  const [step, setStep] = useState<WizardStep>('recipient');
  const [variant, setVariant] = useState<CardVariant>('digital');
  const [formData, setFormData] = useState<FormData>({
    recipientName: '',
    relationship: '',
    occasion: card.occasion,
    message: '',
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [added, setAdded] = useState(false);

  const addItem = useCartStore((s) => s.addItem);
  const setCartOpen = useCartStore((s) => s.setOpen);

  function updateField<K extends keyof FormData>(field: K, value: FormData[K]) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  async function handleGenerateMessage() {
    if (!formData.recipientName || !formData.relationship) return;

    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientName: formData.recipientName,
          relationship: formData.relationship,
          occasion: formData.occasion,
          cardName: card.name,
          cardTone: card.tone,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        updateField('message', data.message);
      }
    } catch {
      // Silently fail - user can write their own message
    } finally {
      setIsGenerating(false);
    }
  }

  function handleAddToCart() {
    addItem(card, variant, 1, {
      recipientName: formData.recipientName,
      relationship: formData.relationship,
      occasion: formData.occasion,
      message: formData.message,
      generatedAt: new Date().toISOString(),
    });
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      setCartOpen(true);
      onComplete?.();
    }, 1000);
  }

  const canProceedRecipient = formData.recipientName.trim() && formData.relationship;
  const canProceedMessage = formData.message.trim().length >= 10;

  return (
    <div className="flex flex-col gap-4">
      {/* Progress indicator */}
      <div className="flex items-center gap-2">
        {(['recipient', 'message', 'preview'] as const).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={cn(
                'flex size-6 items-center justify-center rounded-full text-xs font-medium',
                step === s
                  ? 'bg-text-primary text-panel-background'
                  : 'bg-theme-2 text-text-secondary',
              )}
            >
              {i + 1}
            </div>
            {i < 2 && <div className="h-px w-4 bg-theme-2" />}
          </div>
        ))}
      </div>

      {/* Step: Recipient */}
      {step === 'recipient' && (
        <div className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-text-primary">
              Who is this card for?
            </label>
            <input
              type="text"
              value={formData.recipientName}
              onChange={(e) => updateField('recipientName', e.target.value)}
              placeholder="Enter their name"
              className="w-full rounded-lg border border-theme-2 bg-transparent px-3 py-2 text-text-primary placeholder:text-text-muted focus:border-text-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-text-primary">
              Your relationship
            </label>
            <div className="flex flex-wrap gap-2">
              {RELATIONSHIPS.map((rel) => (
                <button
                  key={rel}
                  onClick={() => updateField('relationship', rel)}
                  className={cn(
                    'rounded-full border px-3 py-1 text-sm transition-colors',
                    formData.relationship === rel
                      ? 'border-text-primary bg-text-primary text-panel-background'
                      : 'border-theme-2 text-text-secondary hover:border-text-secondary',
                  )}
                >
                  {rel}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={onBack} variant="text" className="flex-1">
              Back
            </Button>
            <Button
              onClick={() => setStep('message')}
              disabled={!canProceedRecipient}
              variant="secondary"
              className="flex-1"
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Step: Message */}
      {step === 'message' && (
        <div className="flex flex-col gap-4">
          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="text-sm font-medium text-text-primary">Your message</label>
              <button
                onClick={handleGenerateMessage}
                disabled={isGenerating}
                className="flex items-center gap-1 text-xs text-text-secondary hover:text-text-primary"
              >
                <Sparkles className="size-3" />
                {isGenerating ? 'Generating...' : 'AI Assist'}
              </button>
            </div>
            <textarea
              value={formData.message}
              onChange={(e) => updateField('message', e.target.value)}
              placeholder={`Write a heartfelt message for ${formData.recipientName}...`}
              rows={4}
              className="w-full resize-none rounded-lg border border-theme-2 bg-transparent px-3 py-2 text-text-primary placeholder:text-text-muted focus:border-text-primary focus:outline-none"
            />
            <p className="mt-1 text-xs text-text-muted">
              {formData.message.length}/500 characters
            </p>
          </div>

          <div className="flex gap-2">
            <Button onClick={() => setStep('recipient')} variant="text" className="flex-1">
              Back
            </Button>
            <Button
              onClick={() => setStep('preview')}
              disabled={!canProceedMessage}
              variant="secondary"
              className="flex-1"
            >
              Preview
            </Button>
          </div>
        </div>
      )}

      {/* Step: Preview */}
      {step === 'preview' && (
        <div className="flex flex-col gap-4">
          <div className="rounded-lg border border-theme-2 bg-theme-3 p-4">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-text-muted">
              Preview
            </p>
            <p className="text-sm leading-relaxed text-text-primary">{formData.message}</p>
            <p className="mt-3 text-right text-sm text-text-secondary">
              — For {formData.recipientName}
            </p>
          </div>

          {/* Variant selection */}
          <div className="flex flex-col gap-2">
            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-theme-2 p-3 transition-colors hover:border-text-secondary">
              <input
                type="radio"
                name="variant"
                value="physical"
                checked={variant === 'physical'}
                onChange={() => setVariant('physical')}
                className="size-4 accent-text-primary"
              />
              <div className="flex flex-1 items-center justify-between">
                <div>
                  <div className="font-medium text-text-primary">Physical Card</div>
                  <div className="text-sm text-text-secondary">Printed & shipped</div>
                </div>
                <div className="font-medium text-text-primary">
                  ${(card.pricing.physical + 2).toFixed(2)}
                </div>
              </div>
            </label>

            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-theme-2 p-3 transition-colors hover:border-text-secondary">
              <input
                type="radio"
                name="variant"
                value="digital"
                checked={variant === 'digital'}
                onChange={() => setVariant('digital')}
                className="size-4 accent-text-primary"
              />
              <div className="flex flex-1 items-center justify-between">
                <div>
                  <div className="font-medium text-text-primary">Digital Download</div>
                  <div className="text-sm text-text-secondary">Instant delivery</div>
                </div>
                <div className="font-medium text-text-primary">
                  ${(card.pricing.digital + 2).toFixed(2)}
                </div>
              </div>
            </label>

            <p className="text-center text-xs text-text-muted">
              Includes $2.00 customization fee
            </p>
          </div>

          <div className="flex gap-2">
            <Button onClick={() => setStep('message')} variant="text" className="flex-1">
              Edit
            </Button>
            <Button onClick={handleAddToCart} variant="secondary" className="flex-1">
              {added ? 'Added!' : 'Add to Cart'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
