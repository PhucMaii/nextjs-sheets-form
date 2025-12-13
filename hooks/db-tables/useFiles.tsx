import { getAdminApiUrl } from '@/app/utils/enum';
import axios from 'axios';

const useFiles = () => {
  const getAllFiles = async (
    companyId: string,
    startDate?: string,
    endDate?: string,
  ) => {
    const response = await axios.get(
      getAdminApiUrl(
        companyId,
        `/files?startDate=${startDate || ''}&endDate=${endDate || ''}`,
      ),
    );
    return response.data.data;
  };

  const getDeliveryProofFiles = async (
    companyId: string,
    startDate?: string,
    endDate?: string,
  ) => {
    const response = await axios.get(
      getAdminApiUrl(
        companyId,
        `/files/delivery-proof?startDate=${startDate || ''}&endDate=${endDate || ''}`,
      ),
    );

    return response.data.data;
  };

  const getVendorChequeFiles = async (
    companyId: string,
    startDate?: string,
    endDate?: string,
  ) => {
    const response = await axios.get(
      getAdminApiUrl(
        companyId,
        `/files/vendor-cheque?startDate=${startDate || ''}&endDate=${endDate || ''}`,
      ),
    );

    return response.data.data;
  };

  const getClientChequeFiles = async (
    companyId: string,
    startDate?: string,
    endDate?: string,
  ) => {
    const response = await axios.get(
      getAdminApiUrl(
        companyId,
        `/files/client-cheque?startDate=${startDate || ''}&endDate=${endDate || ''}`,
      ),
    );

    return response.data.data;
  };

  return {
    getAllFiles,
    getDeliveryProofFiles,
    getVendorChequeFiles,
    getClientChequeFiles,
  };
};

export default useFiles;
