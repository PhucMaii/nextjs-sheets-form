'use client';
import React from 'react';
import InventoryTemplate from '../InventoryTemplate';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { getAdminApiUrl } from '@/app/utils/enum';
import { UPDATE_OPTION } from '../../components/Modals/edit/EditItem';

const InventoryDetail = () => {
  const { id, companyId }: any = useParams();
  const router = useRouter();
  const { data: inventoryItem } = useQuery({
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
    applyToAllItems,
    updatedSellingItem,
  }: {
    newInventoryItem: any;
    selectedVendors: any;
    selectedSellingItems: any;
    applyToAllItems: boolean;
    updatedSellingItem: any;
  }) => {
    try {
      const res = await axios.put(getAdminApiUrl(companyId, `/inventory`), {
        ...newInventoryItem,
        vendorItems: selectedVendors,
        updatedSellingItems: selectedSellingItems.filter((item: any) => item.isChanged),
        updatedOption: applyToAllItems ? UPDATE_OPTION.ALL_ITEMS_SAME_NAME : UPDATE_OPTION.CURRENT_CATEGORY,
        updatedSingleSellingItem: updatedSellingItem,
      });

      if (res.data.error) {
        throw new Error(res.data.error);
      }

      router.push(`/admin/${companyId}/inventory`);
    } catch (error: any) {
      console.log(error, 'error');
    }
  };

  return (
    <InventoryTemplate
      onSubmit={handleUpdateInventory}
      buttonLabel="Save"
      defaultSelectedVendors={inventoryItem?.vendorItem || []}
      defaultSellingItems={inventoryItem?.sellingItems || []}
      defaultInventoryItem={inventoryItem || null}
      title="Edit Inventory"
    />
  );
};

export default InventoryDetail;
