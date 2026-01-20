'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import Button from '~/src/components/ui/Button';

import MainHeader from '../../components/Header';
import { collectionFilters, type CollectionFilter } from '~/src/app/create/constants';

const filterLabels: Record<CollectionFilter, string> = {
  all: 'All',
  celebrations: 'Celebrations',
  gratitude: 'Thank You',
  seasonal: 'Seasonal',
  everyday: 'Everyday',
};

export default function Header() {
  const params = useSearchParams();
  const filter = params?.get('f');

  return (
    <MainHeader>
      <div className="filters flex flex-nowrap items-center gap-1 overflow-x-auto overflow-y-hidden whitespace-nowrap scrollbar-none md:overflow-visible">
        {collectionFilters.map((f) => (
          <Button
            key={f}
            asChild
            variant={f === filter || (f === 'all' && !filter) ? 'secondary' : 'primary'}
            className="shrink-0 text-xs md:text-sm"
          >
            <Link href={f === 'all' ? `/cards` : `/cards?f=${f}`}>{filterLabels[f]}</Link>
          </Button>
        ))}
      </div>
    </MainHeader>
  );
}
