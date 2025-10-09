import axios from "axios";

import { getAdminApiUrl } from "@/app/utils/enum";

export const usePrograms = (companyId: string) => {
  
  const getPrograms = async () => { 
    const response = await axios.get(getAdminApiUrl(companyId, '/water-program'));
    return response.data.data;
  };



  return { getPrograms };
};