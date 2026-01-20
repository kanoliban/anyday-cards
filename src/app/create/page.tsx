import { Metadata } from 'next';

import ClientRendered from '~/src/components/ClientRendered';
import { cn } from '~/src/util';

import CartDrawer from '../(main)/shop/components/CartDrawer';
import Description from './components/Description';
import StampsContainer from './components/Stamps/StampsContainer';
import SVGFilters from './components/SVGFilters';

import './page.css';

export const metadata: Metadata = {
  title: 'Cards | AnyDayCard',
  description:
    'Browse our collection of AI-generated greeting cards. Buy as-is or customize with our wizard.',
};

export default function CardsPage() {
  return (
    <div
      className={cn(
        'stamps-page grain grid min-h-svh grid-cols-1 grid-rows-[auto_auto] gap-10 overflow-clip bg-stone-100 lg:h-screen lg:max-h-screen lg:grid-cols-[minmax(auto,600px)_1fr] lg:grid-rows-1 lg:gap-x-6 lg:pl-10 xl:gap-x-10',
      )}
    >
      <style>{`:root{background:#f5f5f4 !important;}`}</style>
      <div className="overflow-y-auto overflow-x-clip scrollbar-thin scrollbar-track-stone-100 scrollbar-thumb-stone-300">
        <Description className="mx-auto max-w-xl px-4 pt-4 lg:pb-10 lg:pt-5" />
      </div>
      <StampsContainer />
      <SVGFilters className="pointer-events-none absolute" />
      <CartDrawer />
    </div>
  );
}
