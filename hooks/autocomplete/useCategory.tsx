import { fetchApi } from '@/app/utils/db';
import { API_URL } from '@/app/utils/enum';
import { Autocomplete, TextField } from '@mui/material';
import { useEffect, useState } from 'react';

const useCategory = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);

  const fetchCategories = async () => {
    const data = await fetchApi(`${API_URL.ADMIN}/categories`);
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
