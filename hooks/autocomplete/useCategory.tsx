import { fetchApi } from '@/app/utils/db';
import { getAdminApiUrl } from '@/app/utils/enum';
import { Autocomplete, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

const useCategory = () => {
  const { companyId }: any = useParams();
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);

  const fetchCategories = async () => {
    const data = await fetchApi(getAdminApiUrl(companyId, '/categories'));
    setCategories(data);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const renderSelectCategory = () => {
    return (
      <Autocomplete
        options={categories || []}
        getOptionLabel={(option: any) => option?.name}
        renderInput={(params) => <TextField {...params} label="Category" />}
        value={
          categories?.find(
            (item: any) =>
              item.id === selectedCategory?.id ||
              item.name === selectedCategory?.name,
          ) || null
        }
        onChange={(e, newValue: any) => {
          setSelectedCategory(newValue);
        }}
        sx={{ width: 'auto' }}
      />
    );
  };

  return {
    categories,
    renderSelectCategory,
    selectedCategory,
  };
};

export default useCategory;
