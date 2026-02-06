import { Suspense } from 'react';

import AssistantClient from './AssistantClient';

function LoadingFallback() {
  return <div className="min-h-dvh bg-stone-100" />;
}

export default function CreateAssistantPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AssistantClient />
    </Suspense>
  );
}

