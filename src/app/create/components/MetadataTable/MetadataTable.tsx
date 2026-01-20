import { ComponentProps, CSSProperties, Fragment } from 'react';
import colors from 'tailwindcss/colors';

import { cn } from '~/src/util';

import { collections } from '../../constants';
import { Card } from '../../models';
import { useCardStore } from '../../store';

import './MetadataTable.css';

const cellKeys = [
  'occasion',
  'style',
  'tone',
  'colors',
  'size',
  'paperStock',
] as const satisfies readonly (keyof Card)[];

type CellKey = (typeof cellKeys)[number];

const cellKeyLabels: Partial<Record<CellKey | string, string>> = {
  occasion: 'Occasion',
  style: 'Style',
  tone: 'Tone',
  colors: 'Colors',
  size: 'Size',
  paperStock: 'Paper Stock',
};

type RowValue = string | string[] | undefined;

function toRowValue(value: unknown): RowValue {
  if (value == null) return undefined;
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string');
  }
  return String(value);
}

function getRows(card: Card): Record<string, RowValue> {
  const labelFor = (key: string) => cellKeyLabels[key as CellKey] ?? key;
  const rows: Record<string, RowValue> = {};

  cellKeys.forEach((key) => {
    rows[labelFor(key)] = toRowValue(card[key]);
  });

  return rows;
}

function KeyCell({ children, className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn('border-b border-stone-300 py-2 text-stone-400 uppercase', className)}
      {...props}
    >
      {children}
    </div>
  );
}

function ValueCell({ children, className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn('border-b border-stone-300 py-2 break-all text-stone-500 uppercase', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export default function MetadataTable({ className }: { className?: string }) {
  const cardStore = useCardStore();
  const collection = collections[cardStore.collection];
  const card = collection.cards.find((c) => c.id === cardStore.selectedCardId) as Card;

  if (!card) {
    return null;
  }

  const rows = getRows(card);

  return (
    <div>
      <div className="font-libertinus mb-5 text-stone-700">
        <div>{card.description}</div>
      </div>
      <div
        className={cn(
          'grid transform-gpu grid-cols-[2fr_3fr] font-mono text-sm font-bold',
          className,
        )}
        key={card?.id}
      >
        {Object.entries(rows).map(([label, value], i) => {
          const isArray = Array.isArray(value);

          const defaultValue = '--';

          return (
            <Fragment key={label}>
              <KeyCell
                className={cn('pr-4', {
                  'border-t': i === 0,
                })}
              >
                {label}
              </KeyCell>
              <ValueCell
                className={cn({
                  'border-t': i === 0,
                })}
                style={
                  {
                    '--color': colors.stone[500],
                  } as CSSProperties
                }
              >
                {isArray ? (
                  <span className="flex flex-col">
                    {(value as string[]).map((code: string, i) => (
                      <span
                        className="typewriter"
                        key={i}
                        style={{ '--n': code.length } as CSSProperties}
                      >
                        {code}
                      </span>
                    ))}
                  </span>
                ) : (
                  <span
                    className="typewriter"
                    style={{ '--n': (value || defaultValue).length } as CSSProperties}
                  >
                    {value ? String(value) : defaultValue}
                  </span>
                )}
              </ValueCell>
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}
