import { getAdminApiUrl } from "@/app/utils/enum";
import axios from "axios";

const useFiles = () => {
    const getAllFiles = async (companyId: string, startDate?: string, endDate?: string) => {
        const response = await axios.get(getAdminApiUrl(companyId, `/files?startDate=${startDate || ''}&endDate=${endDate || ''}`));
        return response.data.data;
    }

    return {
        getAllFiles,
    }
}

export default useFiles;