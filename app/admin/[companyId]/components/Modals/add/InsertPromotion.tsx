import {
  Box,
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  Modal,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { ModalProps } from '../type';
import { BoxModal } from '../styled';
import ModalHead from '@/app/lib/ModalHead';
import { IPromotion } from '@/app/utils/type';
import { SWRFetchData } from '@/app/utils/db';
import { getAdminApiUrl, PROMOTION_STATUS } from '@/app/utils/enum';
import { ShowNotificationType } from '@/hooks/useNotification';
import axios from 'axios';
import AddPromotion from './AddPromotion';
import { useParams } from 'next/navigation';
interface IProps extends ModalProps {
  showNotification: ShowNotificationType;
}

export default function InsertPromotion({
  open,
  onClose,
  showNotification,
}: IProps) {
  const { companyId }: any = useParams();
  const [isOpenAddPromotion, setIsOpenAddPromotion] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedPromotionIds, setSelectedPromotionIds] = useState<number[]>(
    [],
  );

  const [promotions] = SWRFetchData(getAdminApiUrl(companyId, '/promotions'));

  useEffect(() => {
    if (promotions) {
      const activePromotionIds = promotions.data
        .filter(
          (promotion: IPromotion) =>
            promotion.status === PROMOTION_STATUS.ACTIVE,
        )
        .map((promotion: IPromotion) => promotion.id);

      setSelectedPromotionIds(activePromotionIds);
    }
  }, [promotions]);

  const onSelectPromotion = (promotionId: number) => {
    if (selectedPromotionIds.includes(promotionId)) {
      setSelectedPromotionIds(
        selectedPromotionIds.filter((id) => id !== promotionId),
      );
    } else {
      setSelectedPromotionIds([...selectedPromotionIds, promotionId]);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const response = await axios.put(
        `${getAdminApiUrl(companyId, '/appearance/toggle-promotions')}`,
        {
          activePromotionIds: selectedPromotionIds,
        },
      );

      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }

      showNotification('success', 'Promotions updated successfully');
    } catch (error: any) {
      console.log('Fail to update promotion status: ' + error);
      showNotification('error', 'Fail to update promotion status: ' + error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <AddPromotion
        open={isOpenAddPromotion}
        onClose={() => setIsOpenAddPromotion(false)}
        showNotification={showNotification}
      />
      <Modal open={open} onClose={onClose}>
        <BoxModal>
          <ModalHead
            heading="Edit Promotions"
            onClose={onClose}
            buttonLabel="Save"
            onClick={handleSave}
            buttonProps={{ loading: isLoading }}
          />

          <Divider sx={{ my: 2 }} />

          <Button
            variant="outlined"
            fullWidth
            onClick={() => setIsOpenAddPromotion(true)}
          >
            + New Promotion
          </Button>

          <Divider sx={{ my: 2 }}>Select Promotion</Divider>

          <Box display="flex" flexDirection="column" gap={2}>
            {promotions?.data &&
              promotions.data.map((promotion: IPromotion) => (
                <FormControlLabel
                  key={promotion.id}
                  control={
                    <Checkbox
                      checked={selectedPromotionIds.includes(promotion.id)}
                      onChange={() => onSelectPromotion(promotion.id)}
                    />
                  }
                  label={promotion.title}
                />
              ))}
          </Box>
        </BoxModal>
      </Modal>
    </>
  );
}
