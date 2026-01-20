import { create } from 'zustand';

export interface LoupeStore {
  coords: { x: number; y: number };
  angle: number;
  scale: number;
  showBackSide: boolean;
  setCoords: (coords: { x: number; y: number }) => void;
  setAngle: (angle: number) => void;
  setScale: (scale: number) => void;
  setShowBackSide: (show: boolean) => void;
}

export const useLoupeStore = create<LoupeStore>((set) => ({
  coords: { x: 0, y: 0 },
  angle: 0,
  scale: 2,
  showBackSide: false,
  setCoords: (coords: { x: number; y: number }) => set({ coords }),
  setAngle: (angle: number) => set({ angle }),
  setScale: (scale: number) => set({ scale }),
  setShowBackSide: (show: boolean) => set({ showBackSide: show }),
}));
