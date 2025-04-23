import LoadingComponent from '@/app/components/LoadingComponent/LoadingComponent';
import { SWRFetchData } from '@/app/utils/db';
import { API_URL } from '@/app/utils/enum';
import { IPromotion } from '@/app/utils/type';
import useNotification from '@/hooks/useNotification';
import { Box, Button, TextField, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import AddPromotion from '../Modals/add/AddPromotion';
import axios from 'axios';
import { ShadowSection } from '../../reports/styled';
import useDebounce from '@/hooks/useDebounce';
import PromotionTable from '../Tables/PromotionTable';

export default function WebsitePromotion() {
  const [displayPromotions, setDisplayPromotions] = useState<IPromotion[]>([]);
  const [isOpenAddPromotion, setIsOpenAddPromotion] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchKeywords, setSearchKeywords] = useState<string>('');

  const debouncedKeywords = useDebounce(searchKeywords, 500);

  const { showNotification, NotificationComp } = useNotification();

  const [promotions] = SWRFetchData(`${API_URL.ADMIN}/website/promotions`);

  useEffect(() => {
    if (promotions) {
      setDisplayPromotions(promotions?.data);
      setLoading(false);
    }
  }, [promotions]);

  useEffect(() => {
    if (debouncedKeywords) {
      const filteredPromotions = promotions?.data?.filter((promotion: IPromotion) => promotion.title.toLowerCase().includes(debouncedKeywords.toLowerCase()));
      setDisplayPromotions(filteredPromotions);
    } else {
      setDisplayPromotions(promotions?.data || []);
    }
  }, [debouncedKeywords, promotions]);

  const handleAddPromotion = async (data: any) => {
    try {
      const response = await axios.post(
        `${API_URL.ADMIN}/website/promotions`,
        data,
      );

      return response;
    } catch (error) {
      console.log('Something went wrong in adding promotion', error);
      showNotification('error', 'Something went wrong in adding promotion');
    }
  };

  return (
    <Box>
      <AddPromotion
        open={isOpenAddPromotion}
        onClose={() => setIsOpenAddPromotion(false)}
        showNotification={showNotification}
        customOnClick={handleAddPromotion}
        isWebsite
      />
      {NotificationComp}
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Typography variant="h5" fontWeight="bold">
          Promotions
        </Typography>

        <Button variant="contained" onClick={() => setIsOpenAddPromotion(true)}>+ New Promotion</Button>
      </Box>

      <ShadowSection>
        <TextField
          label="Search"
          value={searchKeywords}
          onChange={(e) => setSearchKeywords(e.target.value)}
          fullWidth
          variant="standard"
        />
        {loading ? (
          <LoadingComponent />
        ) : (
          <PromotionTable
            promotions={displayPromotions}
            showNotification={showNotification}
          />
        )}
      </ShadowSection>
    </Box>
  );
}
