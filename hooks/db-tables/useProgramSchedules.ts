import { getAdminApiUrl } from "@/app/utils/enum";
import axios from "axios";

export const useProgramSchedules = (companyId: string) => {
  const getProgramSchedules = async () => {
    const response = await axios.get(getAdminApiUrl(companyId, '/water-program/schedule'));
    return response.data.data;
  };

  const deleteProgramSchedule = async (id: string) => {
    const response = await axios.delete(getAdminApiUrl(companyId, `/water-program/schedule?id=${id}`));
    return response;
  };

  const updateProgramScheduleTime = async (id: string, time: string) => {
    const response = await axios.put(getAdminApiUrl(companyId, `/water-program/schedule/update-time`), { id: Number(id), time });
    return response;
  };

  return { getProgramSchedules, deleteProgramSchedule, updateProgramScheduleTime };
};