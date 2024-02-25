'use client';
import React from 'react';
import AuthenGuard from './HOC/AuthenGuard';
import OrderForm from './form/orderForm';

export default function MainPage() {
  return (
    <AuthenGuard>
      <OrderForm />
    </AuthenGuard>
  );
}
