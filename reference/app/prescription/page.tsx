'use client';

import { Suspense } from 'react';
import PrescriptionService from '@/app/components/PrescriptionService';

export default function PrescriptionPage() {
  return (
    <div className="container mx-auto py-8">
      <Suspense fallback={<div>Loading...</div>}>
        <PrescriptionService />
      </Suspense>
    </div>
  );
}
