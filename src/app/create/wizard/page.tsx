import WarmGuidePage from '../components/WarmGuidePage';
import { Suspense } from 'react';

function WizardLoading() {
  return <div className="h-dvh bg-stone-100" />;
}

export default function WizardPage() {
  return (
    <Suspense fallback={<WizardLoading />}>
      <WarmGuidePage />
    </Suspense>
  );
}
