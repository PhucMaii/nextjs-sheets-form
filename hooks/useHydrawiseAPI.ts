import axios from "axios";
import { getAdminApiUrl } from "@/app/utils/enum";
import { useEffect } from "react";
import { useState } from "react";

export const useHydrawiseAPI = (companyId: string) => {
  const [zones, setZones] = useState<any[]>([]);

  useEffect(() => {
    getZones();
  }, []);

  const getZones = async () => {
    const response = await axios.get(getAdminApiUrl(companyId, '/hydrawise'));

    console.log(response, 'response');

    if (response.status !== 200) {
      throw new Error('Failed to fetch zones');
    }

    const data = await response.data.data;
    console.log(data, 'data');

    setZones(data);

    return data;
  };

  return { zones };
};