'use client';
import React from 'react';
import ClientDetails from '../../components/Clients/ClientDetails';
import Sidebar from '../../components/Sidebar/Sidebar';
import { useParams } from 'next/navigation';

export default function ClientDetailsPage() {
    const { id }: any = useParams();

  return (
    <Sidebar noMargin>
      <ClientDetails
        clientId={id}
        // onClose={() => setSelectedDetailedClient(null)}
      />
    </Sidebar>
  );
}
