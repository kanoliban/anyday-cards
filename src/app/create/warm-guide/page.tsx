import { redirect } from 'next/navigation';

export default function WarmGuideRedirect({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const card = typeof searchParams?.card === 'string' ? searchParams.card : undefined;
  redirect(card ? `/create/wizard?card=${encodeURIComponent(card)}` : '/create/wizard');
}
