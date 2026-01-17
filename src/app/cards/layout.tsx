import { Metadata, Viewport } from 'next';

export const viewport: Viewport = {
  themeColor: '#e7e5e4',
};

export const metadata: Metadata = {
  title: 'AnyDayCard / Card Collection',
  description:
    'Explore our collection of beautifully designed greeting cards. From birthdays to thank you notes, find the perfect card for any occasion.',
};

export default function CardsLayout({ children }: { children: React.ReactNode }) {
  return <div className="cards-layout">{children}</div>;
}
