export type Card = {
  id: string;
  name: string;
  occasion: string;
  style: 'illustrated' | 'typographic' | 'photographic' | 'minimal';
  tone: 'warm' | 'playful' | 'elegant' | 'minimal' | 'festive' | 'serene';
  colors: string[];
  size: string;
  paperStock: string;
  description: string;
  src: string;
  srcLg: string;
  srcBack?: string;
  srcLgBack?: string;
  width?: number;
  height?: number;
};

export type CardCollection = {
  colors: {
    bg: string;
    fg: string;
    mutedBg: string;
    mutedFg: string;
  };
  cards: Card[];
};
