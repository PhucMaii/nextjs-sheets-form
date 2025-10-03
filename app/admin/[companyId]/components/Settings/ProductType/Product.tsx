import { generateImgUrl } from '@/app/lib/s3';
import { IItemPreference } from '@/app/utils/type';
import {
  Card,
  Typography,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  AlertColor,
  Box,
} from '@mui/material';
import { grey, red } from '@mui/material/colors';
import React, { memo, useEffect, useState } from 'react';
import EditItemPreference from '../../Modals/edit/EditItemPreference';
import { useMultipleBoolean } from '@/hooks/useMultipleBoolean';
import DeleteModal from '../../Modals/delete/DeleteModal';
import axios from 'axios';
import { getAdminApiUrl } from '@/app/utils/enum';
import { useParams } from 'next/navigation';

interface IProps {
  itemPreference: IItemPreference;
  showNotification: (type: AlertColor, message: string) => void;
}

const Product = ({ itemPreference, showNotification }: IProps) => {
  const { companyId }: any = useParams();

  const [imgUrl, setImgUrl] = useState<string>('');
  const [open, setOpen] = useMultipleBoolean({
    deleteItemPreference: false,
  });

  useEffect(() => {
    const url = generateImgUrl(itemPreference?.image, false);
    setImgUrl(url || '/images/landing/image_not_found.jpeg');
  }, [itemPreference?.image]);

  const onDeleteItemPref = async () => {
    try {
      const response = await axios.delete(
        getAdminApiUrl(companyId, `/productTypes/item-preference?id=${itemPreference.id}`),
      );

      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }

      showNotification('success', response.data.message);
      setOpen('deleteItemPreference', false);
    } catch (error: any) {
      console.log('Internal Server Error: ', error);
      showNotification(
        'error',
        'Internal Server Error: ' + error?.response?.data?.error,
      );
    }
  };

  return (
    <>
      <DeleteModal
        open={open.deleteItemPreference}
        handleCloseModal={() => setOpen('deleteItemPreference', false)}
        targetObj={itemPreference}
        handleDelete={onDeleteItemPref}
        showTargetObj={itemPreference.name}
      />
      {/* <EditItemPreference
        open={open.editItemPreference}
        onClose={() => setOpen('editItemPreference', false)}
        showNotification={showNotification}
        itemPreference={itemPreference}
      /> */}
      <Card sx={{ maxWidth: 300, maxHeight: 500, minWidth: 300 }}>
        <CardMedia
          sx={{ height: 200 }}
          image={imgUrl}
          title={itemPreference?.inventoryItem?.name}
        />
        <CardContent>
          <Typography variant="h6" fontWeight="regular" gutterBottom>
            {itemPreference?.name || itemPreference.inventoryItem.name}
          </Typography>
          <Box display="flex" alignItems="flex-end" gap={1}>
            <Typography
              variant="h5"
              sx={{
                mt: 2,
                color:
                  itemPreference?.isShowDiscount && itemPreference?.prevPrice
                    ? red[500]
                    : 'black',
              }}
            >
              ${itemPreference?.price?.toFixed(2) || 0}
            </Typography>
            {itemPreference?.isShowDiscount && itemPreference?.prevPrice && (
              <Typography
                variant="body1"
                sx={{ textDecoration: 'line-through', color: grey[500] }}
              >
                ${itemPreference?.prevPrice?.toFixed(2) || 0}
              </Typography>
            )}
          </Box>
        </CardContent>
        <CardActions>
          <Button
            color="error"
            onClick={() => setOpen('deleteItemPreference', true)}
          >
            Remove
          </Button>
          {/* <Button
            color="primary"
            onClick={() => setOpen('editItemPreference', true)}
          >
            Edit
          </Button> */}
          <EditItemPreference
            showNotification={showNotification}
            itemPreference={itemPreference}
          />
        </CardActions>
      </Card>
    </>
  );
};

export default memo(Product, (prev, next) => {
  return Object.is(prev.itemPreference, next.itemPreference);
});
