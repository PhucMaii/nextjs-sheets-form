import axios from 'axios';
import { API_URL, PO_STATUS } from './enum';

export const handleUpdatePOStatus = async (id: number, status: PO_STATUS) => {
  try {
    const response = await axios.put(
      `${API_URL.ADMIN}/purchase-orders/status`,
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
