import { fetchApi } from '@/app/utils/db';
import { getAdminApiUrl } from '@/app/utils/enum';
import { ICategory } from '@/app/utils/type';
import { TextField } from '@mui/material';
import { Autocomplete } from '@mui/material';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export const useCategory = (isDisplayFull: boolean, listingCategories: any[]) => {
  const { companyId }: any = useParams();

  const [categories, setCategories] = useState<ICategory[]>([]);
  const [displayCategories, setDisplayCategories] = useState<ICategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ICategory | null>(
    null,
  );

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (isDisplayFull) {
      setDisplayCategories(categories);
    } else if (listingCategories.length > 0) {
      const displayCategories = categories.filter((category: any) =>
        listingCategories.includes(category.name),
      );
      setDisplayCategories(displayCategories);
    }
  }, [isDisplayFull, listingCategories]);

  const fetchCategories = async () => {
    const categories = await fetchApi(getAdminApiUrl(companyId, '/categories'));
    setCategories(categories);
  };

  const renderCategorySearch = () => {
    return (
      <Autocomplete
        options={displayCategories || []}
        getOptionLabel={(option: any) =>
          option?.sku ? `${option?.sku} | ${option?.name}` : option?.name
        }
        renderInput={(params) => <TextField {...params} label="Category" />}
        value={
          displayCategories?.find(
            (category: any) =>
              category.id === selectedCategory?.id ||
              category.name === selectedCategory?.name,
          ) || null
        }
        onChange={(e, newValue: any) => {
          setSelectedCategory(newValue);
        }}
        sx={{ width: 'auto' }}
        size="small"
      />
    );
  };

  return {
    categories,
    selectedCategory,
    setSelectedCategory,
    renderCategorySearch,
  };
};
