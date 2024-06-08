import { API_URL } from '@/app/utils/enum';
import useSWR from 'swr';

const useSubCategories = () => {
  const {
    data: subcategories,
    mutate,
    isLoading,
  } = useSWR(API_URL.SUBCATEGORIES);

  return { subCategories: subcategories?.data || [], mutate, isLoading };
};

export default useSubCategories;
