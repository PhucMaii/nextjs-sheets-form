import { API_URL } from '@/app/utils/enum';
import useSWR from 'swr';

const useCategories = () => {
  const { data: categories, mutate } = useSWR(API_URL.CATEGORIES);

  return { categories: categories?.data || [], mutate };
};

export default useCategories;
