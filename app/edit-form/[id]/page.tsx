'use client';
import React from 'react';
import EditForm from './form';
import AuthenGuard from '@/app/HOC/AuthenGuard';

export default function EditPage() {
  return (
    <AuthenGuard>
      <EditForm />
    </AuthenGuard>
  );
}
