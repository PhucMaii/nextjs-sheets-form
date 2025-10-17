'use client';
import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import { Tab, Tabs, Typography } from '@mui/material';
import { blueGrey } from '@mui/material/colors';
import Programs from '../components/Farm/Programs/Programs';
import ProgramSchedules from '../components/Farm/Schedule/ProgramSchedules';
import useNotification from '@/hooks/useNotification';
import BundlePrograms from '../components/Farm/Bundle/BundlePrograms';
import { useParams, useRouter, useSearchParams } from 'next/navigation';

export default function Farm() {
  const { companyId }: any = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [tab, setTab] = useState('programs');
  const paramsTab = searchParams?.get('tab');

  const { showNotification, NotificationComp } = useNotification();

  useEffect(() => {
    if (paramsTab) {
      setTab(paramsTab);
    } else {
      setTab('programs');
    }
  }, [paramsTab]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (tab) {
      params.set('tab', tab);
    } else {
      params.delete('tab');
    }

    router.replace(`/admin/${companyId}/farm?${params.toString()}`, {
      scroll: false,
    });
  }, [tab]);

  const renderedComponents: any = {
    programs: <Programs showNotification={showNotification} />,
    schedules: <ProgramSchedules showNotification={showNotification} />,
    bundles: <BundlePrograms />,
  }

  return (
    <Sidebar>
      {NotificationComp}
      <Typography variant="h5" color={blueGrey[800]}>
        Farm
      </Typography>
      <Tabs
        value={tab}
        onChange={(e, value) => setTab(value)}
        sx={{ borderBottom: '1px solid #e0e0e0' }}
      >
        <Tab label="Programs" value="programs" />
        <Tab label="Schedules" value="schedules" />
        <Tab label="Bundle Programs" value="bundles" />
      </Tabs>

      {renderedComponents[tab]}
      
    </Sidebar>
  );
}
