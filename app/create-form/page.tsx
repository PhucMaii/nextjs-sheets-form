import React from 'react';
import CreateForm from './form';
import { getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]/route';

export default async function CreateFormPage() {
  const session = await getServerSession(authOptions);
  return (
    <div>
      <CreateForm session={session} />
    </div>
  );
}
