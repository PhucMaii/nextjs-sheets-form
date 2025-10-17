import { getAdminApiUrl } from '@/app/utils/enum';
import axios from 'axios';

const useBundleProgram = (companyId: string) => {
  const createBundleProgram = async (name: string, daySchedules: any[]) => {
    const response = await axios.post(
      getAdminApiUrl(companyId, '/bundle-program'),
      { name, daySchedules },
    );
    return response;
  };

  const getBundlePrograms = async () => {
    const response = await axios.get(
      getAdminApiUrl(companyId, '/bundle-program'),
    );
    return response.data.data;
  };

  return { createBundleProgram, getBundlePrograms };
};

export default useBundleProgram;