'use client';

import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry';

import DynamicVHVarsSetter from '~/src/components/DynamicVHVarsSetter';
import { ExitIcon } from '~/src/components/icons';
import Button from '~/src/components/ui/Button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '~/src/components/ui/Dialog';
import Image from '~/src/components/ui/Image';
import Tag from '~/src/components/ui/Tag';
import useMatchMedia from '~/src/hooks/useMatchMedia';
import { cn } from '~/src/util';

import type { Card, CardVariant } from '../models';
import Carousel from '../../(main)/cards/components/Carousel';
import WorkCard from '../../(main)/cards/components/Card';
import CardPurchaseForm from './CardPurchaseForm';

type Props = {
  cards: Card[];
};

export default function CardsGrid({ cards }: Props) {
  const titleRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const cardRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  const mobile = useMatchMedia('(max-width: 768px)', false);

  function setTitleHeight(i: number) {
    cardRefs.current
      .get(i)
      ?.style.setProperty(
        '--title-height',
        titleRefs.current.get(i)?.clientHeight?.toString() || '0',
      );
  }

  useEffect(() => {
    cardRefs.current.forEach((_, i) => {
      setTitleHeight(i);
    });
  }, []);

  const [openCard, setOpenCard] = useState<string>('');

  return (
    <div className="flex-1 px-5 py-10">
      <DynamicVHVarsSetter />
      <ResponsiveMasonry columnsCountBreakPoints={{ 750: 2, 900: 3 }}>
        <Masonry gutter={mobile ? '0.5rem' : '1rem'}>
          {cards.map((card, i) => {
            const images = [card.srcLg || card.src];
            if (card.srcLgBack || card.srcBack) {
              images.push(card.srcLgBack || card.srcBack!);
            }

            return (
              <Dialog
                key={card.id}
                onOpenChange={(open) => {
                  if (open) {
                    setOpenCard(card.id);
                  }
                }}
              >
                <DialogContent className="flex h-full max-h-[calc(var(--vh,1vh)*100)] max-w-(--breakpoint-md) flex-col pb-6 sm:rounded-[20px] md:max-h-[min(calc(var(--vh,1vh)*100),800px)]">
                  <div className="-mx-3 h-[90vw] md:h-auto md:flex-1">
                    <Carousel
                      defaultIndex={0}
                      sources={images}
                      actions={
                        <DialogClose aria-label="Close dialog" asChild>
                          <Button
                            iconLeft={<ExitIcon className="size-6" />}
                            className="opacity-50 group-hover/card:opacity-100 focus-visible:opacity-100"
                          />
                        </DialogClose>
                      }
                    />
                  </div>

                  <div className="flex flex-col overflow-auto md:overflow-auto">
                    <div>
                      <DialogTitle className="mb-2">{card.name}</DialogTitle>
                      <div className="flex flex-wrap items-center gap-2">
                        <Tag className="text-sm text-text-secondary">
                          {card.occasion}
                        </Tag>
                        <Tag className="text-sm text-text-secondary">
                          {card.paperStock}
                        </Tag>
                      </div>
                    </div>

                    {card.description && (
                      <DialogDescription className="mt-4 border-t border-t-theme-2 pt-4 leading-7 text-text-secondary">
                        {card.description}
                      </DialogDescription>
                    )}

                    <CardPurchaseForm card={card} className="mt-4" />
                  </div>
                </DialogContent>

                <DialogTrigger asChild>
                  <motion.button
                    initial={{ translateY: 75, opacity: 0 }}
                    animate={{ translateY: 0, opacity: 1 }}
                    exit={{ translateY: 75, opacity: 0 }}
                    transition={{
                      ease: 'easeOut',
                      duration: 0.5,
                      delay: i * 0.1,
                    }}
                    onAnimationComplete={() => setTitleHeight(i)}
                    className="group relative flex w-full rounded-lg text-left md:rounded-2xl"
                    style={{ aspectRatio: card.aspect || 0.75 }}
                  >
                    <WorkCard
                      ref={(e) => {
                        cardRefs.current.set(i, e!);
                      }}
                      containerClassName="h-full w-full"
                      className="h-full w-full overflow-hidden"
                    >
                      <div className="h-full w-full translate-y-0 overflow-hidden rounded transition-all duration-300 group-hover:translate-y-[calc(var(--title-height)*-1px)] group-focus-visible:translate-y-[calc(var(--title-height)*-1px)] md:rounded-lg">
                        <div className="relative h-full w-full translate-y-0 overflow-hidden rounded transition-all duration-300 group-hover:translate-y-[calc(var(--title-height)*1px)] group-focus-visible:translate-y-[calc(var(--title-height)*1px)] md:rounded-xl">
                          <Image
                            alt={card.name}
                            src={card.src}
                            quality={100}
                            fill
                            className="object-cover object-center"
                            sizes="(max-width: 900px): 50vw, (max-width: 1200px) 33vw, 420px"
                            priority={i < 3}
                          />
                        </div>
                      </div>
                      <div
                        className="title absolute bottom-0 left-0 w-full translate-y-full rounded-tl-md rounded-tr-md p-2 px-3 transition-all duration-300 group-hover:translate-y-[-4px] group-focus-visible:translate-y-[-4px]"
                        ref={(e) => {
                          titleRefs.current.set(i, e!);
                        }}
                      >
                        <span className="text-text-primary">{card.name}</span>
                        <span className="ml-2 text-sm text-text-secondary">
                          From ${card.pricing.digital.toFixed(2)}
                        </span>
                      </div>
                    </WorkCard>
                  </motion.button>
                </DialogTrigger>
              </Dialog>
            );
          })}
        </Masonry>
      </ResponsiveMasonry>
    </div>
  );
}
