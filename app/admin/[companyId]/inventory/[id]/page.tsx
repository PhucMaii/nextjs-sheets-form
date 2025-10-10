'use client';
import React from 'react';
import InventoryTemplate from '../InventoryTemplate';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { getAdminApiUrl } from '@/app/utils/enum';
import useNotification from '@/hooks/useNotification';

const InventoryDetail = () => {
  const { id, companyId }: any = useParams();
  const router = useRouter();
  const { showNotification, NotificationComp } = useNotification();
  const { data: inventoryItem, isLoading } = useQuery({
    queryKey: ['inventoryItem', id],
    queryFn: async () => {
      const response = await axios.get(
        getAdminApiUrl(companyId, `/inventory?inventoryItemId=${id}`),
      );
      return response.data.data;
    },
  });

  const handleUpdateInventory = async ({
    newInventoryItem,
    selectedVendors,
    selectedSellingItems,
  }: {
    newInventoryItem: any;
    selectedVendors: any;
    selectedSellingItems: any;
  }) => {
    try {
      // return;
      const res = await axios.put(getAdminApiUrl(companyId, `/inventory`), {
        id: Number(id),
        name: newInventoryItem.name,
        sku: newInventoryItem.sku,
        supplierSku: newInventoryItem.supplierSku,
        hasPST: newInventoryItem.hasPST,
        hasGST: newInventoryItem.hasGST,
        isShowInventory: newInventoryItem.isShowInventory,
        isShowQuantity: newInventoryItem.isShowQuantity,
        isInternal: newInventoryItem?.isInternal,
        typeId: newInventoryItem.typeId,
        image: newInventoryItem?.image || '',
        vendorItems: selectedVendors,
        updatedSellingItems: selectedSellingItems.map((item: any) => ({
          ...item,
          category: {
            id: item.category.id,
          },
        })),
        subtractRules: newInventoryItem?.subtractRules || [],
      });

      if (res.data.error) {
        throw new Error(res.data.error);
      }

      showNotification('success', 'Inventory item updated successfully');
      router.back();
    } catch (error: any) {
      showNotification('error', 'Fail to update inventory item');
      console.log(error, 'error');
    }
  };

  return (
    <>
      {NotificationComp}
      <InventoryTemplate
        onSubmit={handleUpdateInventory}
        buttonLabel="Save"
        defaultSelectedVendors={inventoryItem?.vendorItem || []}
        defaultSellingItems={inventoryItem?.sellingItems || []}
        defaultInventoryItem={inventoryItem || null}
        title={'Edit Inventory'}
        isInitializing={isLoading}
        showNotification={showNotification}
      />
    </>
  );
};

export default InventoryDetail;
