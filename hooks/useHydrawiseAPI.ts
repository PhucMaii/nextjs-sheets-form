import axios from "axios";
import { getAdminApiUrl } from "@/app/utils/enum";
import { useEffect } from "react";
import { useState } from "react";

export const useHydrawiseAPI = (companyId: string) => {
  const [zones, setZones] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);  

  useEffect(() => {
    if (zones.length === 0) {
      getZones();
    }
  }, []);

  const getZones = async () => {
    const response = await axios.get(getAdminApiUrl(companyId, '/hydrawise'));

    if (response.status !== 200) {
      throw new Error('Failed to fetch zones');
    }

    const data = await response.data.data;

    setZones(data);
    setIsLoading(false);
    return data;
  };

  return { zones, isLoading };
};