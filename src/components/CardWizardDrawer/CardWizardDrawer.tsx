'use client';

import { Drawer } from 'vaul';
import { X } from 'lucide-react';

import CardWizard from '~/src/app/create/components/CardWizard';
import type { Card } from '~/src/app/create/models';
import { useCardStore } from '~/src/app/create/store';

type Props = {
  card: Card;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CardWizardDrawer({ card, open, onOpenChange }: Props) {
  const startWizard = useCardStore((s) => s.startWizard);
  const resetWizard = useCardStore((s) => s.resetWizard);

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) startWizard();
    else resetWizard();
    onOpenChange(isOpen);
  };

  return (
    <Drawer.Root open={open} onOpenChange={handleOpenChange} direction="right">
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <Drawer.Content className="fixed bottom-0 right-0 top-0 z-50 flex w-full max-w-xl flex-col bg-panel-background outline-none">
          <div className="flex items-center justify-between border-b border-panel-border p-4">
            <Drawer.Title className="text-lg font-medium text-text-primary">
              Personalize Your Card
            </Drawer.Title>
            <button
              onClick={() => onOpenChange(false)}
              className="rounded-full p-2 text-text-secondary hover:bg-theme-2"
            >
              <X className="size-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            <CardWizard
              card={card}
              onComplete={() => onOpenChange(false)}
              onBack={() => onOpenChange(false)}
            />
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
