import { API_URL } from '@/app/utils/enum';
import useSWR from 'swr';

const useSubCategories = () => {
  const { data: subcategories, mutate } = useSWR(API_URL.SUBCATEGORIES);

  return { subcategories: subcategories?.data || [], mutate };
};

export default useSubCategories;
