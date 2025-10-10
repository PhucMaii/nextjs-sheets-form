'use client';
import React from 'react';
import InventoryTemplate from '../InventoryTemplate';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { getAdminApiUrl } from '@/app/utils/enum';
import useNotification from '@/hooks/useNotification';

export default function CreateInventoryPage() {
  const { companyId }: any = useParams();
  const router = useRouter();
  const { showNotification, NotificationComp } = useNotification();

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
      // remove category field from selling items
      let sellingItems: any[] = [];
      if (selectedSellingItems && selectedSellingItems.length > 0) {
        sellingItems = selectedSellingItems.map((item: any) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { category, ...rest } = item;
          return rest;
        });
      }

      const response = await axios.post(
        getAdminApiUrl(companyId, '/inventory'),
        {
          name: newInventoryItem.name,
          sku: newInventoryItem.sku,
          typeId: newInventoryItem?.typeId,
          hasGST: newInventoryItem.hasGST,
          hasPST: newInventoryItem.hasPST,
          isShowInventory: newInventoryItem.isShowInventory,
          isShowQuantity: newInventoryItem.isShowQuantity,
          isInternal: newInventoryItem?.isInternal,
          vendorItems: selectedVendors,
          sellingItems,
          image: newInventoryItem?.image || '',
          subtractRules: newInventoryItem?.subtractRules || [],
        },
      );

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      showNotification('success', 'Inventory item created successfully');
      router.push(`/admin/${companyId}/inventory`);
    } catch (error: any) {
      console.log('Fail to create inventory item: ', error);
      showNotification('error', 'Fail to create inventory item');
    }
  };

  return (
    <>
      {NotificationComp}
      <InventoryTemplate
        onSubmit={handleCreateInventory}
        buttonLabel="Create"
        title="Create Inventory"
        showNotification={showNotification}
      />
    </>
  );
}
