import { getAdminApiUrl } from "@/app/utils/enum";
import axios from "axios";

const useFiles = () => {
    const getAllFiles = async (companyId: string) => {
        const response = await axios.get(getAdminApiUrl(companyId, '/files'));
        return response.data.data;
    }

    return {
        getAllFiles,
    }
}

export default useFiles;