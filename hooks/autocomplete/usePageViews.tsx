import { useEffect } from 'react';

import { fetchApi } from '@/app/utils/db';
import { getAdminApiUrl } from '@/app/utils/enum';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Checkbox, TextField } from '@mui/material';
import { Autocomplete } from '@mui/material';

const usePageViews = (initialSelectedPageViews: any[]) => {
  const { companyId }: any = useParams();

  const [pageViews, setPageViews] = useState<any[]>([]);
  const [selectedPageViews, setSelectedPageViews] = useState<any[]>([]);

  useEffect(() => {
    const fetchPageViews = async () => {
      const data = await fetchApi(getAdminApiUrl(companyId, '/page-views'));

      setPageViews(data || []);
    };

    fetchPageViews();
  }, []);

  useEffect(() => {
    if (initialSelectedPageViews && initialSelectedPageViews.length > 0) {
      const initPageViews = initialSelectedPageViews.map((pageView) => pageView.pageView);

      setSelectedPageViews(initPageViews);
    }
  }, [initialSelectedPageViews]); 

  console.log({
    pageViews,
    selectedPageViews,
  })

  const renderPageViewSearch = () => {
    return (
      <Autocomplete
        options={pageViews || []}
        getOptionLabel={(option: any) => option?.title}
        renderInput={(params) => <TextField {...params} label="Page View" />}
        value={selectedPageViews}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        onChange={(e, newValue: any) => {
          setSelectedPageViews(newValue);
        }}
        sx={{ width: 'auto' }}
        renderOption={(props, option, { selected }) => {
          console.log(option, 'option in renderOption');
          console.log(selected, 'selected in renderOption');
          if (!option) return null;

          
          // if (!pageViews || pageViews?.length === 0) return null;
          const isSelected = selectedPageViews?.some(
            (item: any) => item.id === option.id,
          );

          if (option.id === 2) {
            console.log({
              option,
              isSelected,
            })
          }

          return (
            <li {...props}>
              <Checkbox
                checked={selected}
                // onChange={(e: any) => {
                //   e.stopPropagation();

                //   if (option.id === 2) {
                //     console.log('isSelected in onChange', selected);
                //   }

                //   if (selected) {
                //     setSelectedPageViews((prev: any) =>
                //       prev?.filter(
                //         (item: any) => item.id !== option.id,
                //       ),
                //     );
                //   } else {
                //     setSelectedPageViews((prev: any) => [...prev, option]);
                //   }
                // }}
              />
              {option.title}
            </li>
          );
        }}
        disableCloseOnSelect
        multiple
      />
    );
  };

  return { pageViews, renderPageViewSearch, selectedPageViews, setSelectedPageViews };
};

export default usePageViews;
