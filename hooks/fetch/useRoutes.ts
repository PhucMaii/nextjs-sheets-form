import { API_URL } from '@/app/utils/enum';
import useSWR from 'swr';

const useRoutes = (day: string) => {
  const { data: routes, mutate } = useSWR(`${API_URL.ROUTES}?day=${day}`);

  return { routes: routes?.data || [], mutate };
};

export default useRoutes;