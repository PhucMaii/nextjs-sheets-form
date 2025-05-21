import { getAdminApiUrl } from '@/app/utils/enum';
import useSWR from 'swr';
import { useParams } from 'next/navigation';

const useRoutes = (day: string) => {
  const { companyId }: any = useParams();
  const { data: routes, mutate } = useSWR(
    getAdminApiUrl(companyId, `/routes?day=${day}`),
  );

  return { routes: routes?.data || [], mutate };
};

export default useRoutes;
