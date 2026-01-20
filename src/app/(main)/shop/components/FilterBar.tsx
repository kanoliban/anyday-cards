'use client';

import { CollectionType, collectionTypes } from '~/src/app/create/constants';
import { cn } from '~/src/util';

type Props = {
  selected: CollectionType | 'all';
  onSelect: (collection: CollectionType | 'all') => void;
};

const collectionLabels: Record<CollectionType | 'all', string> = {
  all: 'All Cards',
  celebrations: 'Celebrations',
  gratitude: 'Gratitude',
  seasonal: 'Seasonal',
  everyday: 'Everyday',
};

export default function FilterBar({ selected, onSelect }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onSelect('all')}
        className={cn(
          'rounded-full px-4 py-2 text-sm font-medium transition-colors',
          selected === 'all'
            ? 'bg-text-primary text-text-contrast'
            : 'bg-panel-overlay text-text-secondary hover:bg-panel-overlay/80'
        )}
      >
        {collectionLabels.all}
      </button>
      {collectionTypes.map((collection) => (
        <button
          key={collection}
          onClick={() => onSelect(collection)}
          className={cn(
            'rounded-full px-4 py-2 text-sm font-medium capitalize transition-colors',
            selected === collection
              ? 'bg-text-primary text-text-contrast'
              : 'bg-panel-overlay text-text-secondary hover:bg-panel-overlay/80'
          )}
        >
          {collectionLabels[collection]}
        </button>
      ))}
    </div>
  );
}
