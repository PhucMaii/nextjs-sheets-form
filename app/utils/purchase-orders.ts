import axios from 'axios';
import { PO_STATUS, getAdminApiUrl } from './enum';

export const handleUpdatePOStatus = async (
  companyId: string,
  id: number,
  status: PO_STATUS,
) => {
  try {
    const response = await axios.put(
      getAdminApiUrl(companyId, '/purchase-orders/status'),
      {
        id,
        status,
      },
    );

    return response.data;
  } catch (error) {
    console.log('Error updating PO status: ', error);
    return null;
  }
};
