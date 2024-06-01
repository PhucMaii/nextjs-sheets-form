import { API_URL } from "@/app/utils/enum";
import useSWR from "swr";

const useDrivers = () => {
    const { data: driverList, mutate } = useSWR(API_URL.DRIVERS);

    return { driverList: driverList?.data || [], mutate }
}

export default useDrivers;