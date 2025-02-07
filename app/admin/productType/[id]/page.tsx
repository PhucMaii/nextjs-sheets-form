'use client';
import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
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
import { API_URL } from '@/app/utils/enum';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import AddItemIntoType from '../../components/Modals/add/AddItemIntoType';
import { useMultipleBoolean } from '@/hooks/useMultipleBoolean';
import useNotification from '@/hooks/useNotification';
import Product from '../../components/Settings/ProductType/Product';
import ErrorComponent from '../../components/ErrorComponent';

export default function page() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();

  const [searchKeywords, setSearchKeywords] = useState<string>('');

  const [open, setOpen] = useMultipleBoolean({
    addItemIntoType: false,
    editItemPreference: false,
  });
  const { showNotification, NotificationComp } = useNotification();
  const [type] = SWRFetchData(`${API_URL.ADMIN}/productTypes?id=${id}`);

  const mdDown = useMediaQuery((theme: any) => theme.breakpoints.down('md'));

  console.log('re render in product type page');
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
          <IconButton onClick={() => router.push(`/admin/settings?tab=1`)}>
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

      {type?.data && type?.data?.itemPreferences?.length > 0 ? (
        <Box
          display="flex"
          justifyContent={mdDown ? 'center' : 'flex-start'}
          alignItems="center"
          gap={2}
          flexWrap={'wrap'}
        >
          {type?.data.itemPreferences.map((item: any, index: number) => (
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
