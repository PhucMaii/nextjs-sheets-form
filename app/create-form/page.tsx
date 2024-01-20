'use client';
import React from 'react';
import CreateForm from './form';
import AuthenGuard from '../HOC/AuthenGuard';

export default async function CreateFormPage() {
  return (
    <AuthenGuard>
      <CreateForm />
    </AuthenGuard>
  );
}
