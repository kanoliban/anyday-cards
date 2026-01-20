import { create } from 'zustand';

import { CollectionType } from './constants';
import type { WizardAnswers, WizardStep } from './models';

interface CardStore {
  selectedCardId: string;
  collection: CollectionType;
  isZoomed: boolean;
  zoomEnabled: boolean;
  toggleZoomed: () => void;
  setZoomed: (zoomed: boolean) => void;
  setSelectedCardId: (selectedCardId: string) => void;
  setZoomEnabled: (zoomEnabled: boolean) => void;
  setCollection: (collection: CollectionType) => void;
  reset: () => void;
  cardsDrawerOpen: boolean;
  setCardsDrawerOpen: (cardsDrawerOpen: boolean) => void;

  // Wizard state
  wizardMode: boolean;
  wizardStep: WizardStep;
  wizardAnswers: Partial<WizardAnswers>;
  setWizardMode: (mode: boolean) => void;
  setWizardStep: (step: WizardStep) => void;
  setWizardAnswer: <K extends keyof WizardAnswers>(key: K, value: WizardAnswers[K]) => void;
  resetWizard: () => void;
  startWizard: () => void;
}

export const useCardStore = create<CardStore>((set) => ({
  selectedCardId: '',
  collection: 'celebrations' as CollectionType,
  isZoomed: false,
  zoomEnabled: false,
  toggleZoomed: (force?: boolean) => {
    set((state) => ({ isZoomed: force !== undefined ? force : !state.isZoomed }));
  },
  setZoomed: (zoomed: boolean) => set({ isZoomed: zoomed }),
  setSelectedCardId: (selectedCardId: string) => set({ selectedCardId, wizardMode: false }),
  setZoomEnabled: (zoomEnabled: boolean) => set({ zoomEnabled }),
  setCollection: (collection: CollectionType) => {
    set({ collection, selectedCardId: '', wizardMode: false });
  },
  reset: () => set({ isZoomed: false, zoomEnabled: false, selectedCardId: '', wizardMode: false }),
  cardsDrawerOpen: false,
  setCardsDrawerOpen: (state: boolean) => {
    if (!state) {
      set({ cardsDrawerOpen: false, isZoomed: false, zoomEnabled: false, selectedCardId: '', wizardMode: false });
    } else {
      set({ cardsDrawerOpen: true });
    }
  },

  // Wizard state
  wizardMode: false,
  wizardStep: 'name',
  wizardAnswers: {},
  setWizardMode: (mode: boolean) => set({ wizardMode: mode }),
  setWizardStep: (step: WizardStep) => set({ wizardStep: step }),
  setWizardAnswer: (key, value) =>
    set((state) => ({
      wizardAnswers: { ...state.wizardAnswers, [key]: value },
    })),
  resetWizard: () =>
    set({
      wizardMode: false,
      wizardStep: 'name',
      wizardAnswers: {},
    }),
  startWizard: () =>
    set({
      wizardMode: true,
      wizardStep: 'name',
      wizardAnswers: {},
    }),
}));
