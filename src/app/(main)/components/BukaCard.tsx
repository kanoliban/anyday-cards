import Link from 'next/link';

import { ArrowRightIcon, LettersIcon } from '~/src/components/icons';
import CardTitle from '~/src/components/ui/CardTitle';

import Card from './Card';

export default function ShopCTACard() {
  return (
    <Card className="h-full">
      <div className="flex h-full flex-col justify-between gap-7">
        <div className="flex justify-between">
          <CardTitle variant="mono" className="border-panel-border">
            Ready to send?
          </CardTitle>
        </div>
        <div className="flex items-center gap-4">
          <LettersIcon className="size-10 text-theme-1" />
          <div className="font-archivo text-3xl md:text-4xl">
            <Link
              className="group flex items-center gap-3 rounded-lg"
              href="/create"
            >
              Shop Now
              <ArrowRightIcon className="group-hover:bg-theme-3 size-8 rounded-full p-1 transition-all duration-150 md:size-12" />
            </Link>
          </div>
        </div>
        <p className="text-text-primary text-sm">
          Find the perfect card for any occasion. Browse our collection of thoughtfully designed
          greeting cards, available as physical prints or instant digital downloads.
        </p>
      </div>
    </Card>
  );
}

export { ShopCTACard as BukaCard };
