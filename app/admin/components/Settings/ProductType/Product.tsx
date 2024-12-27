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
} from '@mui/material';
import { grey } from '@mui/material/colors';
import React from 'react';
import EditItemPreference from '../../Modals/edit/EditItemPreference';
import { useMultipleBoolean } from '@/hooks/useMultipleBoolean';
import DeleteModal from '../../Modals/delete/DeleteModal';
import axios from 'axios';
import { API_URL } from '@/app/utils/enum';

interface IProps {
  itemPreference: IItemPreference;
  showNotification: (type: AlertColor, message: string) => void;
}

export default function Product({ itemPreference, showNotification }: IProps) {
  const [open, setOpen] = useMultipleBoolean({
    editItemPreference: false,
    deleteItemPreference: false,
  });

  const handleDeleteItemPreference = async () => {
    try {
      const response = await axios.delete(
        `${API_URL.ADMIN}/productTypes/item-preference?id=${itemPreference.id}`,
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
        handleDelete={handleDeleteItemPreference}
        showTargetObj={itemPreference.inventoryItem.name}
      />
      <EditItemPreference
        open={open.editItemPreference}
        onClose={() => setOpen('editItemPreference', false)}
        showNotification={showNotification}
        itemPreference={itemPreference}
      />
      <Card sx={{ maxWidth: 300, maxHeight: 500, minWidth: 300 }}>
        <CardMedia
          sx={{ height: 200 }}
          image={
            itemPreference?.image ? generateImgUrl(itemPreference?.image) : '/images/landing/image_not_found.jpeg'
          }
          title={itemPreference?.inventoryItem?.name}
        />
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {itemPreference.inventoryItem?.name}
          </Typography>
          <Typography variant="body1" sx={{ color: grey[600] }}>
            {itemPreference.description}
          </Typography>
        </CardContent>
        <CardActions>
          <Button
            color="error"
            onClick={() => setOpen('deleteItemPreference', true)}
          >
            Remove
          </Button>
          <Button
            color="primary"
            onClick={() => setOpen('editItemPreference', true)}
          >
            Edit
          </Button>
        </CardActions>
      </Card>
    </>
  );
}
