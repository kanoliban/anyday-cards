import { Metadata } from 'next';

import ClientRendered from '~/src/components/ClientRendered';
import ViewLogger from '~/src/components/ViewCounter';

import CardsGrid from '~/src/app/cards/components/CardsGrid';
import { cards, CollectionFilter } from '~/src/app/cards/constants';

export const metadata: Metadata = {
  title: 'Cards | anydaycard',
  description:
    'Browse our collection of AI-generated greeting cards. Buy as-is or customize with our wizard.',
};

export default async function Work({ searchParams }: { searchParams: Promise<{ f?: CollectionFilter }> }) {
  const params = await searchParams;
  const filteredCards = cards.filter((card) => {
    if (!params?.f || params?.f === 'all') {
      return true;
    }

    return card.collection === params?.f;
  });

  return (
    <div className="flex flex-1 flex-col">
      <ViewLogger pathname="/work" />
      <main className="flex-1">
        {/* todo: hotfix, remove client rendered */}
        <ClientRendered>
          <CardsGrid cards={filteredCards} />
        </ClientRendered>
      </main>
    </div>
  );
}
