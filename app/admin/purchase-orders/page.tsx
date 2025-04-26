'use client';
import React, { useEffect, useMemo, useState } from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import {
  Box,
  Button,
  Grid,
  Skeleton,
  TextField,
  Typography,
} from '@mui/material';
import SelectDateRange from '../components/Select/SelectDateRange';
import { generateMonthRange } from '@/app/utils/time';
import { ShadowSection } from '../reports/styled';
import POTable from '../components/Tables/POTable';
import { useRouter } from 'next/navigation';
import { SWRFetchData } from '@/app/utils/db';
import { API_URL, PO_STATUS } from '@/app/utils/enum';
import { IPurchaseOrder } from '@/app/utils/type';
import useNotification from '@/hooks/useNotification';
import useDebounce from '@/hooks/useDebounce';
import OverviewCard from '../components/OverviewCard/OverviewCard';
import { ShoppingCart } from '@mui/icons-material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { blue } from '@mui/material/colors';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

export default function PurchaseOrders() {
  const [dateRange, setDateRange] = useState<any>(() => generateMonthRange());
  const [isInitialized, setIsInitialized] = useState<boolean>(true);
  const [poList, setPoList] = useState<IPurchaseOrder[]>([]);
  const [searchKeywords, setSearchKeywords] = useState<string>('');

  const debounceKeywords = useDebounce(searchKeywords, 1000);

  const { showNotification, NotificationComp } = useNotification();

  const router = useRouter();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [purchaseOrders, _mutate, isValidating] = SWRFetchData(
    `${API_URL.ADMIN}/purchase-orders?startDate=${dateRange[0]}&endDate=${dateRange[1]}`,
  );

  const itemsRate = useMemo(() => {
    const activePoList = poList?.filter(
      (po) => po.status !== PO_STATUS.CANCELLED,
    );

    const receivedItems = activePoList?.reduce((acc, po) => {
      const receivedItems = po.poItems.reduce((acc, item) => {
        return acc + (item?.receivedQty || 0);
      }, 0);

      return acc + receivedItems;
    }, 0);

    const rejectedItems = activePoList?.reduce((acc, po) => {
      const rejectedItems = po.poItems.reduce((acc, item) => {
        return acc + (item?.rejectedQty || 0);
      }, 0);

      return acc + rejectedItems;
    }, 0);

    const totalItems = activePoList?.reduce((acc, po) => {
      const totalItems = po.poItems.reduce((acc, item) => {
        return acc + (item?.orderedQty || 0);
      }, 0);

      return acc + totalItems;
    }, 0);

    const receivedItemsRate = (receivedItems / totalItems) * 100;
    const rejectedItemsRate = (rejectedItems / totalItems) * 100;

    return { receivedItemsRate, rejectedItemsRate };
  }, [poList]);

  useEffect(() => {
    if (purchaseOrders && !isValidating) {
      setPoList(purchaseOrders.data);
      setIsInitialized(false);
    } else if (!purchaseOrders && isValidating) {
      setIsInitialized(true);
    }
  }, [purchaseOrders]);

  useEffect(() => {
    if (debounceKeywords && purchaseOrders?.data) {
      const lowerCaseKeywords = debounceKeywords.toLowerCase();

      const sortedPoList = purchaseOrders?.data?.filter(
        (po: IPurchaseOrder) => {
          return (
            po?.poNumber
              ?.toString()
              .toLowerCase()
              .includes(lowerCaseKeywords) ||
            po?.vendor?.name?.toLowerCase().includes(lowerCaseKeywords)
          );
        },
      );

      setPoList(sortedPoList);
    } else {
      setPoList(purchaseOrders?.data);
    }
  }, [debounceKeywords]);

  return (
    <Sidebar>
      {NotificationComp}
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Typography variant="h5" fontWeight="semibold">
          Purchase Orders
        </Typography>
        <SelectDateRange dateRange={dateRange} setDateRange={setDateRange} />
      </Box>

      <ShadowSection>
        {/* Overview */}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <OverviewCard
              text="Purchase Orders"
              value={poList?.length || 0}
              icon={<ShoppingCart sx={{ color: blue[700], fontSize: 50 }} />}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <OverviewCard
              text="Received Items Rate (%)"
              value={itemsRate?.receivedItemsRate?.toFixed(2) || 0}
              icon={<TrendingUpIcon sx={{ color: blue[700], fontSize: 50 }} />}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <OverviewCard
              text="Rejected Items Rate (%)"
              value={itemsRate?.rejectedItemsRate?.toFixed(2) || 0}
              icon={
                <TrendingDownIcon sx={{ color: blue[700], fontSize: 50 }} />
              }
            />
          </Grid>
        </Grid>

        <Grid container alignItems="center" spacing={1} mt={2}>
          <Grid item xs={8} md={11}>
            <TextField
              label="Search"
              placeholder="Search order by amount, date, vendor, or name..."
              size="small"
              fullWidth
              value={searchKeywords}
              onChange={(e) => setSearchKeywords(e.target.value)}
            />
          </Grid>
          <Grid item xs={4} md={1}>
            <Button
              onClick={() => router.push('/admin/purchase-orders/create')}
              variant="contained"
            >
              + Create
            </Button>
          </Grid>
        </Grid>
        {isInitialized ? (
          <Skeleton variant="rectangular" height={500} sx={{ mt: 2 }} />
        ) : (
          <POTable poList={poList} showNotification={showNotification} />
        )}
      </ShadowSection>
    </Sidebar>
  );
}
