'use client';
import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import { Box, Tab, Tabs, Typography } from '@mui/material';
import { settingsTabs } from '@/app/lib/constant';
import { blueGrey } from '@mui/material/colors';
import EditProfile from '../components/Settings/EditProfile';
import ErrorComponent from '../components/ErrorComponent';
import Announcement from '../components/Settings/Announcement';
import ProductType from '../components/Settings/ProductType';
import { useRouter, useSearchParams } from 'next/navigation';

export default function SettingsPage() {
  const [tabIndex, setTabIndex] = useState<number>(0);

  const searchParams = useSearchParams();
  const router = useRouter();
  console.log(searchParams?.get('tab'), 'searchParams');

  useEffect(() => {
    const tab = searchParams?.get('tab');

    if (tab) {
      setTabIndex(parseInt(tab));
    }
  }, [searchParams?.get('tab')]);
  return (
    <Sidebar>
      <Typography variant="h5" color={blueGrey[800]} sx={{ mb: 2 }}>
        Settings
      </Typography>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          aria-label="basic tabs"
          value={tabIndex}
          onChange={(e, newValue) => router.push("/admin/settings?tab=" + newValue)}
          variant="scrollable"
          scrollButtons="auto"
          //   sx={{ width: '100%' }}
        >
          {settingsTabs &&
            settingsTabs.map((tab: any, index: number) => {
              return (
                <Tab
                  key={index}
                  //   icon={<statusTab.icon />}
                  id={`simple-tab-${index}`}
                  label={tab}
                  aria-controls={`tabpanel-${index}`}
                  value={index}
                  sx={{
                    // '&.Mui-selected': { color: statusTab.color },
                    fontWeight: 600,
                  }}
                />
              );
            })}
        </Tabs>
      </Box>
      {tabIndex === 0 ? (
        <EditProfile />
      ) : tabIndex === 1 ? (
        <ProductType />
      ) : tabIndex === 2 ? (
        <Announcement />
      ) : (
        <ErrorComponent errorText="Page Coming Soon" />
      )}
    </Sidebar>
  );
}
