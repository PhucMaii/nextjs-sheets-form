import React from 'react'
import InventoryTable from '../Tables/InventoryTable'
import { Box } from '@mui/material'
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { getAdminApiUrl } from '@/app/utils/enum';
import useNotification from '@/hooks/useNotification';

export default function InternalItems() {
    const { companyId }: any = useParams();

    // Data Fetching
    const { data: internalItems } = useQuery({
      queryKey: ['internalItems', companyId],
      queryFn: async () => {
        const response = await axios.get(getAdminApiUrl(companyId, '/inventory?isInternal=true'));
        return response.data.data;
      },
    });

    console.log(internalItems, 'INTERNAL ITEMS');

    const { showNotification } = useNotification();
    
  return (
    <Box>
        <InventoryTable
            inventoryItems={internalItems || []}
            showNotification={showNotification}
            itemTypes={[]}
        />
    </Box>
  )
}