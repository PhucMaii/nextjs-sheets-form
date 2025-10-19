import axios from 'axios';

import { getAdminApiUrl } from '@/app/utils/enum';
import { Program } from '@/app/admin/[companyId]/components/Farm/types';

export const usePrograms = (companyId: string, programs: Program[]) => {
  const getProgramById = (id: string): Program | undefined =>
    programs?.find((p: Program) => Number(p.id) === Number(id));

  const getPrograms = async () => {
    const response = await axios.get(
      getAdminApiUrl(companyId, '/water-program'),
    );
    return response.data.data;
  };

  const activateProgram = async (programId: string) => {
    const response = await axios.post(
      getAdminApiUrl(companyId, '/water-program/activate'),
      { programId },
    );
    return response;
  };

  const stopProgram = async (programId: string) => {
    const response = await axios.post(
      getAdminApiUrl(companyId, '/water-program/stop'),
      { programId },
    );
    return response;
  };

  return {
    getPrograms,
    activateProgram,
    stopProgram,
    getProgramById,
  };
};
