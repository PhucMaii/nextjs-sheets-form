'use client';
import React, { Suspense } from 'react';
import LoadingComponent from '../components/LoadingComponent/LoadingComponent';
import PaymentSuccessfulContent from './PaymentSuccessfulContent';

export default function PaymentSuccessfulPage() {
  return (
    <Suspense fallback={<LoadingComponent />}>
      <PaymentSuccessfulContent />
    </Suspense>
  );
}