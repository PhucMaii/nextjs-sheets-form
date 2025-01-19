import { InputAdornment, TextField } from '@mui/material'
import { grey } from '@mui/material/colors'
import React, { useEffect, useState } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import useDebounce from '@/hooks/useDebounce';
import SearchPopover from './SearchPopover';
import { API_URL } from '@/app/utils/enum';
import { SWRFetchData } from '@/app/utils/db';

export default function Searchbar({width}: any) {
    const [anchor, setAnchor] = useState<null | HTMLElement>(null);
    const openDropdown = Boolean(anchor);
    const [filteredItems, setFilteredItems] = useState<any>([]);
    const [isOpenSearch, setIsOpenSearch] = useState<boolean>(false);    
    const [searchKeywords, setSearchKeywords] = useState<string>('');

    const [allItemPreferences] = SWRFetchData(`${API_URL.PUBLIC}/products`);

    const debouncedKeywords = useDebounce(searchKeywords, 1000);

    useEffect(() => {
      if (debouncedKeywords) {
        setIsOpenSearch(true);
        filterItems();
      } else {
        setIsOpenSearch(false);
      }
    }, [debouncedKeywords]);

  const filterItems = () => {
    const items = allItemPreferences?.data || [];

    const preprocessedItems = items.map((item: any) => ({
      original: item,
      normalized: {...item, name: item.inventoryItem.name.toLowerCase()}, // Precompute the lowercase version
    }));

    const keywords: any = debouncedKeywords?.toLowerCase().split(/\s+/);
    const searchItems = preprocessedItems
    .filter(({ normalized }: any) =>
        keywords.some((keyword: string[]) => normalized.name.includes(keyword))
    )
    .map(({ original }: any) => original);

    setFilteredItems(searchItems.slice(0, 5));
  }

  return (
    <>
      <SearchPopover 
        open={isOpenSearch}
        onClose={() => setIsOpenSearch(false)}
        anchorEl={anchor}
        debouncedKeywords={debouncedKeywords || ''}
        searchItems={filteredItems}
      />
        <TextField
            size="small"
            placeholder="What are you looking for today?"
            onClick={(e: any) => setAnchor(e.currentTarget)}
            aria-controls={openDropdown ? 'basic-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={openDropdown ? 'true' : undefined}
            value={searchKeywords}
            onChange={(e) => {
              e.stopPropagation();
              setSearchKeywords(e.target.value)
            }}
            sx={{
              backgroundColor: grey[200], 
              borderRadius: 5, 
              width,
              '.MuiInputBase-root': {
                borderRadius: '15px',
                backgroundColor: grey[200],  
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
          />
    </>
  )
}
