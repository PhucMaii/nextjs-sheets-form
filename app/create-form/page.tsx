import React from 'react';
import CreateForm from './form';
import { getServerSession } from 'next-auth';
import { SessionWithId } from '../utils/type';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

export default async function CreateFormPage() {
  const session: SessionWithId | null = await getServerSession(authOptions);

  return (
    <div>
      <CreateForm session={session} />
    </div>
  );
}
