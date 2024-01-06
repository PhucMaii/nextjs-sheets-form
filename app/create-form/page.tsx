import React from 'react';
import CreateForm from './form';
import { getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]/route';
import { SessionWithId } from '../utils/type';

export default async function CreateFormPage() {
  const session: SessionWithId | null = await getServerSession(authOptions);

  return (
    <div>
      <CreateForm session={session} />
    </div>
  );
}
