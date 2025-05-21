'use client';
import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import { Box, Button, TextField, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AddVendor from '../components/Modals/add/AddVendor';
import { useMultipleBoolean } from '@/hooks/useMultipleBoolean';
import useNotification from '@/hooks/useNotification';
import { SWRFetchData } from '@/app/utils/db';
import { getAdminApiUrl } from '@/app/utils/enum';
import VendorTable from '../components/Tables/VendorTable';
import { ShadowSection } from '../reports/styled';
import { IVendor } from '@/app/utils/type';
import useDebounce from '@/hooks/useDebounce';
import { handleSearch } from '@/app/utils/search';
import LoadingComponent from '@/app/components/LoadingComponent/LoadingComponent';
import { useParams } from 'next/navigation';

export default function Vendors() {
  const { companyId }: any = useParams();
  const [displayData, setDisplayData] = useState<IVendor[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchKeywods, setSearchKeywords] = useState<string>('');

  const [open, setOpen] = useMultipleBoolean({
    addVendor: false,
  });
  const debouncedKeywords = useDebounce(searchKeywods, 1000);
  const { showNotification, NotificationComp } = useNotification();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [vendors, _mutate, isValidating] = SWRFetchData(
    getAdminApiUrl(companyId, '/vendors'),
  );

  useEffect(() => {
    if (vendors && !isValidating) {
      setIsLoading(false);
      setDisplayData(vendors.data);
    } else {
      setIsLoading(true);
      setDisplayData([]);
    }
  }, [vendors]);

  useEffect(() => {
    if (debouncedKeywords) {
      const searchedVendors = handleSearch(
        debouncedKeywords,
        vendors?.data || [],
        ['name', 'address'],
      );

      setDisplayData(searchedVendors);
    } else {
      setDisplayData(vendors?.data || []);
    }
  }, [debouncedKeywords]);

  return (
    <Sidebar>
      {NotificationComp}
      <AddVendor
        open={open.addVendor}
        onClose={() => setOpen('addVendor', false)}
        showNotification={showNotification}
      />
      <Box display="flex" alignItems="center" gap={1}>
        <Typography variant="h5" fontWeight="bold">
          Vendors ({vendors?.data?.length || 0})
        </Typography>
        <Button onClick={() => setOpen('addVendor', true)}>
          <Box display="flex" alignItems="center" gap={0.5}>
            <AddIcon />
            <Typography variant="body2" fontWeight="bold">
              New Vendor
            </Typography>
          </Box>
        </Button>
      </Box>

      {isLoading ? (
        <LoadingComponent />
      ) : (
        <ShadowSection mt={2} display="flex" flexDirection="column" gap={2}>
          <TextField
            label="Search"
            variant="filled"
            placeholder="Search vendors by name or address..."
            value={searchKeywods}
            onChange={(e) => setSearchKeywords(e.target.value)}
            fullWidth
          />

          <VendorTable
            vendors={displayData}
            showNotification={showNotification}
          />
        </ShadowSection>
      )}
    </Sidebar>
  );
}
