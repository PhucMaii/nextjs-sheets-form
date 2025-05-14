import { Box, IconButton, Typography, useMediaQuery } from '@mui/material';
import { blueGrey } from '@mui/material/colors';
import React, { useEffect, useState } from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SelectDateRange from '../Select/SelectDateRange';
import { generateMonthRange } from '@/app/utils/time';
import { SWRFetchData } from '@/app/utils/db';
import { getAdminApiUrl } from '@/app/utils/enum';
import ClientDetailsContent from './ClientDetailsContent';
import LoadingComponent from '@/app/components/LoadingComponent/LoadingComponent';
import { useRouter, useParams } from 'next/navigation';

interface IProps {
  clientId: number;
  // onClose: () => void;
}

export default function ClientDetails({ clientId }: IProps) {
  const [dateRange, setDateRange] = useState<any>(() => generateMonthRange());
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const router = useRouter();
  const { companyId }: any = useParams();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [orders, _mutate, isValidating] = SWRFetchData(
    getAdminApiUrl(
      companyId,
      `/clients/orders?userId=${clientId}&startDate=${dateRange[0]}&endDate=${dateRange[1]}`,
    ),
  );

  const smDown = useMediaQuery((theme: any) => theme.breakpoints.down('sm'));

  useEffect(() => {
    if (isValidating && !orders) {
      setIsLoading(true);
    } else {
      setIsLoading(false);
    }
  }, [orders]);

  return (
    <Box>
      <Box
        display={'flex'}
        gap={1}
        alignItems={'center'}
        justifyContent={'space-between'}
        p={2}
        mb={2}
        pr={6}
        sx={{ boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px' }}
      >
        <IconButton onClick={() => router.push(`/admin/${companyId}/clients`)}>
          <ArrowBackIcon fontSize="medium" />
        </IconButton>
        <Box>
          <Typography variant="h5" color={blueGrey[800]} textAlign={'right'}>
            {orders?.data[0]?.user?.clientName}
          </Typography>
          <Typography
            variant="subtitle1"
            color={blueGrey[200]}
            textAlign={'right'}
          >
            {orders?.data[0]?.user?.clientId}
          </Typography>
        </Box>
      </Box>

      <Box
        display={'flex'}
        justifyContent={'flex-end'}
        m={smDown ? 0 : 2}
        px={smDown ? 0 : 2}
      >
        <SelectDateRange dateRange={dateRange} setDateRange={setDateRange} />
      </Box>

      {isLoading ? (
        <LoadingComponent />
      ) : (
        <ClientDetailsContent
          orders={orders?.data || []}
          dateRange={dateRange}
          style={{
            m: smDown ? 0 : 2,
            pr: smDown ? 0 : 2,
          }}
        />
      )}
    </Box>
  );
}
