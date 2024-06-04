import { API_URL } from '@/app/utils/enum';
import useSWR from 'swr';

const useClients = (dayRoute?: string) => {
  const apiReq = dayRoute
    ? `${API_URL.CLIENTS}?dayRoute=${dayRoute}`
    : API_URL.CLIENTS;
  const { data: clientList, mutate } = useSWR(apiReq);

  return { clientList: clientList?.data || [], mutate };
};

export default useClients;
