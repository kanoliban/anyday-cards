'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import Button from '~/src/components/ui/Button';

import MainHeader from '../../(main)/components/Header';
import CartButton from '../../(main)/shop/components/CartButton';
import { collectionFilters, CollectionFilter } from '../constants';

function getFilterLabel(filter: CollectionFilter): string {
  if (filter === 'all') return 'All';
  return filter.charAt(0).toUpperCase() + filter.slice(1);
}

export default function Header() {
  const params = useSearchParams();
  const currentFilter = params?.get('c') as CollectionFilter | null;

  return (
    <MainHeader>
      <div className="filters flex flex-nowrap items-center gap-1 overflow-x-auto overflow-y-hidden whitespace-nowrap scrollbar-none md:overflow-visible">
        {collectionFilters.map((f) => (
          <Button
            key={f}
            asChild
            variant={f === currentFilter || (!currentFilter && f === 'all') ? 'secondary' : 'primary'}
            className="shrink-0 text-xs md:text-sm"
          >
            <Link href={f === 'all' ? '/cards' : `/cards?c=${f}`}>{getFilterLabel(f)}</Link>
          </Button>
        ))}
      </div>
      <CartButton />
    </MainHeader>
  );
}
