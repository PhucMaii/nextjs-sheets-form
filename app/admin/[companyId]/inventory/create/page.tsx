'use client';
import React from 'react';
import InventoryTemplate from '../InventoryTemplate';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { getAdminApiUrl } from '@/app/utils/enum';

export default function CreateInventoryPage() {
  const { companyId }: any = useParams();
  const router = useRouter();

  const handleCreateInventory = async ({
    newInventoryItem,
    selectedVendors,
    selectedSellingItems,
  }: {
    newInventoryItem: any;
    selectedVendors: any;
    selectedSellingItems: any;
  }) => {
    try {
      const response = await axios.post(
        getAdminApiUrl(companyId, '/inventory'),
        {
          name: newInventoryItem.name,
          sku: newInventoryItem.sku,
          typeId: newInventoryItem.typeId,
          hasGST: newInventoryItem.hasGST,
          hasPST: newInventoryItem.hasPST,
          vendorItems: selectedVendors,
          sellingItems: selectedSellingItems,
        },
      );

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      router.push(`/admin/${companyId}/inventory`);
    } catch (error: any) {
      console.log('Fail to create inventory item: ', error);
    }
  };
  return (
    <InventoryTemplate onSubmit={handleCreateInventory} buttonLabel="Create" title="Create Inventory" />
  );
}
