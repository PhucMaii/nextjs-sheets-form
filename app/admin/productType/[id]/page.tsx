'use client';
import React, { useEffect, useState } from 'react';
import Sidebar from '../../[companyId]/components/Sidebar/Sidebar';
import {
  Box,
  Button,
  Divider,
  IconButton,
  InputAdornment,
  OutlinedInput,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useParams, useRouter } from 'next/navigation';
import { SWRFetchData } from '@/app/utils/db';
import { getAdminApiUrl } from '@/app/utils/enum';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import AddItemIntoType from '../../[companyId]/components/Modals/add/AddItemIntoType';
import { useMultipleBoolean } from '@/hooks/useMultipleBoolean';
import useNotification from '@/hooks/useNotification';
import Product from '../../[companyId]/components/Settings/ProductType/Product';
import ErrorComponent from '../../[companyId]/components/ErrorComponent';
import useDebounce from '@/hooks/useDebounce';
import { IItemPreference } from '@/app/utils/type';

export default function page() {
  const params: any = useParams();
  const id = params?.id as string;
  const router = useRouter();

  const [displayItemPref, setDisplayItemPref] = useState<IItemPreference[]>([]);
  const [searchKeywords, setSearchKeywords] = useState<string>('');

  const debouncedKeywords = useDebounce(searchKeywords, 1000);

  const [open, setOpen] = useMultipleBoolean({
    addItemIntoType: false,
    editItemPreference: false,
  });
  const { showNotification, NotificationComp } = useNotification();
  const [type] = SWRFetchData(getAdminApiUrl(params?.companyId, `/productTypes?id=${id}`));

  const mdDown = useMediaQuery((theme: any) => theme.breakpoints.down('md'));

  useEffect(() => {
    if (type?.data) {
      setDisplayItemPref(type.data.itemPreferences);
    }
  }, [type]);

  useEffect(() => {
    if (debouncedKeywords) {
      const newDisplayItemPref = type?.data?.itemPreferences.filter(
        (item: any) =>
          item.name.toLowerCase().includes(debouncedKeywords.toLowerCase()),
      );

      setDisplayItemPref(newDisplayItemPref || []);
    } else {
      setDisplayItemPref(type?.data?.itemPreferences || []);
    }
  }, [debouncedKeywords, type]);

  return (
    <Sidebar>
      {NotificationComp}
      <AddItemIntoType
        open={open.addItemIntoType}
        onClose={() => setOpen('addItemIntoType', false)}
        showNotification={showNotification}
        typeId={Number(id)}
      />
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box display="flex" alignItems="center" gap={2}>
          <IconButton onClick={() => router.push(`/admin/website`)}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" fontWeight="bold">
            {type?.data?.name}
          </Typography>
        </Box>
        <OutlinedInput
          size="small"
          placeholder="Search"
          value={searchKeywords}
          sx={{ borderRadius: 2 }}
          onChange={(e) => setSearchKeywords(e.target.value)}
          startAdornment={
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          }
        />
      </Box>

      <Divider sx={{ mt: 2 }} />

      <Box display="flex" justifyContent="flex-end">
        <Button
          variant="outlined"
          onClick={() => setOpen('addItemIntoType', true)}
        >
          + Add Item
        </Button>
      </Box>

      {displayItemPref.length > 0 ? (
        <Box
          display="flex"
          justifyContent={mdDown ? 'center' : 'flex-start'}
          alignItems="center"
          gap={2}
          flexWrap={'wrap'}
        >
          {displayItemPref.map((item: any, index: number) => (
            // <>
            //   hee
            // </>
            <Product
              key={index}
              itemPreference={item}
              showNotification={showNotification}
            />
          ))}
        </Box>
      ) : (
        <ErrorComponent errorText="No Item Found" />
      )}
    </Sidebar>
  );
}
