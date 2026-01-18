'use client';

import { MotionProps } from 'framer-motion';

import ClientRendered from '~/src/components/ClientRendered';
import { Drawer, DrawerContent, DrawerDescription, DrawerTitle } from '~/src/components/ui/Drawer';

import { useCardStore } from '../../store';
import { AnswerSummary } from '../../wizard';
import Stamps from './Stamps';
import { useIsMobile } from './util';

export default function StampsContainer() {
  const store = useCardStore();
  const wizardMode = useCardStore((s) => s.wizardMode);

  const desktopStampsProps: MotionProps = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.5 },
  };

  const isMobile = useIsMobile();

  return (
    <ClientRendered>
      {isMobile ? (
        <Drawer
          open={store.cardsDrawerOpen}
          onOpenChange={store.setCardsDrawerOpen}
          autoFocus={false}
          shouldScaleBackground={false}
        >
          <DrawerContent
            overlayClassName="opacity-0!"
            handle={false}
            className="rounded-none! border-none! bg-stone-100 shadow-[0_-2px_10px_0_rgba(0,0,0,0.05),0_-1px_6px_0_rgba(0,0,0,0.05)] data-[vaul-drawer-direction=bottom]:max-h-[calc(100svh-46px)] focus-visible:outline-none lg:hidden"
          >
            <DrawerTitle className="sr-only">Stamps</DrawerTitle>
            <DrawerDescription className="sr-only">Drag and explore stamps</DrawerDescription>
            <Stamps className="min-h-[calc(100svh-46px)]" />
            {wizardMode && <AnswerSummary className="mx-4 mb-4" />}
          </DrawerContent>
        </Drawer>
      ) : (
        <div className="z-2 col-1 hidden flex-col border-l border-stone-300 lg:col-2 lg:flex lg:min-w-[680px]">
          <Stamps
            className="flex-1 pr-2 lg:pr-8"
            {...desktopStampsProps}
          />
          {wizardMode && <AnswerSummary className="mx-4 mb-4 shrink-0" />}
        </div>
      )}
    </ClientRendered>
  );
}
