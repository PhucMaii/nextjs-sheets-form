'use client';
import React from 'react';
import InventoryTemplate from '../InventoryTemplate';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { getAdminApiUrl } from '@/app/utils/enum';

const InventoryDetail = () => {
  const { id, companyId }: any = useParams();

  const { data: inventoryItem } = useQuery({
    queryKey: ['inventoryItem', id],
    queryFn: async () => {
      const response = await axios.get(
        getAdminApiUrl(companyId, `/inventory?inventoryItemId=${id}`),
      );
      return response.data.data;
    },
  });
  console.log(inventoryItem, 'inventoryItem');
  return (
    <InventoryTemplate
      onSubmit={async () => {}}
      buttonLabel="Save"
      defaultSelectedVendors={inventoryItem?.vendorItem || []}
      defaultSellingItems={inventoryItem?.sellingItems || []}
      defaultInventoryItem={inventoryItem || null}
      title="Edit Inventory"
    />
  );
};

export default InventoryDetail;
