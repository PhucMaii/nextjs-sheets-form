'use client';
import React, { useEffect, useMemo, useState } from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import { Box, Button, Grid, TextField, Typography } from '@mui/material';
import ProductLossTable from '../components/Tables/ProductLossTable';
import { ShadowSection } from '../reports/styled';
import AddProductLoss from '../components/Modals/add/AddProductLoss';
import useNotification from '@/hooks/useNotification';
import { IProductLoss } from '@/app/utils/type';
import { generateMonthRange } from '@/app/utils/time';
import SelectDateRange from '../components/Select/SelectDateRange';
import { fetchApi } from '@/app/utils/db';
import { getAdminApiUrl } from '@/app/utils/enum';
import LoadingComponent from '@/app/components/LoadingComponent/LoadingComponent';
import useDebounce from '@/hooks/useDebounce';
import OverviewCard from '../components/OverviewCard/OverviewCard';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import InventoryIcon from '@mui/icons-material/Inventory';
import { blue, grey } from '@mui/material/colors';
import FlagIcon from '@mui/icons-material/Flag';
import { useParams } from 'next/navigation';

export default function ProductLoss() {
  const { companyId }: any = useParams();
  const [displayList, setDisplayList] = useState<IProductLoss[]>([]);
  const [dateRange, setDateRange] = useState<any>(generateMonthRange());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isOpenProductLoss, setIsOpenProductLoss] = useState<boolean>(false);
  const [productLossList, setProductLossList] = useState<IProductLoss[]>([]);
  const [searchKeywords, setSearchKeywords] = useState<string>('');

  const debouncedSearchKeywords = useDebounce(searchKeywords, 500);

  const { showNotification, NotificationComp } = useNotification();

  const overviewData = useMemo(() => {
    if (!displayList || displayList.length === 0)
      return {
        totalLoss: 0,
        lossQuantity: 0,
        mostCommonLossType: '',
        mostCommonLossTypeCount: 0,
      };

    const totalLoss = displayList.reduce(
      (acc, curr) => acc + (curr?.totalCost || 0),
      0,
    );
    const lossQuantity = displayList.reduce(
      (acc, curr) => acc + (curr?.quantityLost || 0),
      0,
    );
    const recurringLossType = displayList.reduce((acc: any, curr: any) => {
      const type = curr.lossType;
      if (acc[type]) {
        acc[type]++;
      } else {
        acc[type] = 1;
      }
      return acc;
    }, {});

    const mostCommonLossType = Object.entries(recurringLossType).sort(
      (a: any, b: any) => b[1] - a[1],
    )[0];

    return {
      totalLoss,
      lossQuantity,
      mostCommonLossType: mostCommonLossType[0],
      mostCommonLossTypeCount: mostCommonLossType[1],
    };
  }, [displayList]);

  const fetchProductLossList = async () => {
    const data = await fetchApi(
      getAdminApiUrl(
        companyId,
        `/product-loss?startDate=${dateRange[0]}&endDate=${dateRange[1]}`,
      ),
      showNotification,
    );

    setProductLossList(data);
    setIsLoading(false);
  };

  useEffect(() => {
    if (dateRange) {
      setIsLoading(true);
      fetchProductLossList();
    }
  }, [dateRange]);

  useEffect(() => {
    if (debouncedSearchKeywords) {
      const filteredList = productLossList.filter((productLoss) => {
        const lowerCaseKeywords = debouncedSearchKeywords.toLowerCase();
        return (
          productLoss.inventoryItem?.name
            .toLowerCase()
            .includes(lowerCaseKeywords) ||
          productLoss?.description?.toLowerCase().includes(lowerCaseKeywords) ||
          productLoss?.lossType?.toLowerCase().includes(lowerCaseKeywords) ||
          productLoss?.reportedBy?.toLowerCase().includes(lowerCaseKeywords)
        );
      });
      setDisplayList(filteredList);
    } else {
      setDisplayList(productLossList);
    }
  }, [productLossList, debouncedSearchKeywords]);

  return (
    <Sidebar>
      {NotificationComp}
      {isOpenProductLoss && (
        <AddProductLoss
          open={isOpenProductLoss}
          onClose={() => setIsOpenProductLoss(false)}
          showNotification={showNotification}
          refresh={fetchProductLossList}
        />
      )}

      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h5">Product Loss</Typography>
        <SelectDateRange dateRange={dateRange} setDateRange={setDateRange} />
      </Box>

      <ShadowSection display="flex" flexDirection="column" gap={2}>
        <Grid container spacing={1} alignItems="center">
          {/* Overview Section */}
          <Grid item xs={12} md={6} lg={4}>
            <OverviewCard
              text="Total Loss ($)"
              value={overviewData.totalLoss?.toFixed(2) || 0}
              icon={<AttachMoneyIcon sx={{ color: blue[700], fontSize: 50 }} />}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <OverviewCard
              text="Loss Quantity"
              value={overviewData.lossQuantity}
              icon={<InventoryIcon sx={{ color: blue[700], fontSize: 50 }} />}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <OverviewCard
              text="Most Common Loss Type"
              value={overviewData.mostCommonLossType}
              icon={<FlagIcon sx={{ color: blue[700], fontSize: 50 }} />}
              extraText={{
                text: `(${overviewData.mostCommonLossTypeCount})`,
                color: grey[500],
              }}
            />
          </Grid>

          <Grid item xs={10.5} xl={11.5}>
            <TextField
              label="Search"
              variant="outlined"
              size="small"
              fullWidth
              value={searchKeywords}
              onChange={(e) => setSearchKeywords(e.target.value)}
            />
          </Grid>
          <Grid item xs={1.5} xl={0.5}>
            <Button
              onClick={() => setIsOpenProductLoss(true)}
              fullWidth
              variant="contained"
              color="primary"
            >
              + Report Loss
            </Button>
          </Grid>
        </Grid>

        {isLoading ? (
          <LoadingComponent />
        ) : (
          <ProductLossTable
            productLossList={displayList}
            showNotification={showNotification}
            refresh={fetchProductLossList}
          />
        )}
      </ShadowSection>
    </Sidebar>
  );
}
