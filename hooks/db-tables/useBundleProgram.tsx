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

  const deleteBundleProgram = async (id: string) => {
    const response = await axios.delete(getAdminApiUrl(companyId, `/bundle-program?id=${id}`));
    return response;
  };

  return { createBundleProgram, getBundlePrograms, deleteBundleProgram };
};

export default useBundleProgram;