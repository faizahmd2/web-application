'use client';

import { Suspense } from 'react';
import WebhookContent from './webhook-content';
import { useParams } from 'next/navigation';

export default function WebhookPage() {
    const params = useParams();
    const id = params?.id as string || '';
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <WebhookContent id={id} />
    </Suspense>
  );
}