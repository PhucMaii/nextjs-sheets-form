import { IItem } from '@/app/utils/type';
import { AlertColor, Box, Chip, Grid, Paper, Typography } from '@mui/material';
import React, { useMemo, useState } from 'react';
import EditItemAvailability from '../Modals/edit/EditItemAvailability';
import DeleteModal from '../Modals/delete/DeleteModal';
import EditItem from '../Modals/edit/EditItem';
import { grey } from '@mui/material/colors';
import { generateImgUrl } from '@/app/lib/s3';
import { websiteItemCategory } from '@/app/lib/constant';

interface IProps {
  item: IItem;
  handleDeleteItem: (targetItem: IItem) => Promise<void>;
  handleUpdateItem: (updatedItem: IItem) => Promise<void>;
  showNotification: (type: AlertColor, message: string) => void;
}

export default function Item({
  item,
  handleUpdateItem,
  handleDeleteItem,
  showNotification,
}: IProps) {
  const smallestOption = useMemo(() => {
    if (item?.options && item?.options.length > 0) {
      return item.options.reduce((prev, curr) =>
        prev.price < curr.price ? prev : curr,
      );
    }

    return null;
  }, [item.options]);

  const [isOpenEditItem, setIsOpenEditItem] = useState<boolean>(false);

  return (
    <>
      <EditItem
        open={isOpenEditItem}
        onClose={() => setIsOpenEditItem(false)}
        targetItem={item}
        showNotification={showNotification}
      />
      <Paper
        elevation={0}
        sx={{
          py: 2,
          '&:hover': { cursor: 'pointer', backgroundColor: grey[50] },
        }}
        onClick={() => {
          setIsOpenEditItem(true);
        }}
      >
        <Grid container alignItems="center" columnSpacing={1}>
          <Grid item lg={1} md={12}>
            <EditItemAvailability
              item={item}
              showNotification={showNotification}
              handleUpdateItem={handleUpdateItem}
            />
          </Grid>
          {item.categoryId === websiteItemCategory && (
            <Grid item md={2}>
              {item?.image || item?.inventoryItem?.image   ? (
                <img
                  src={generateImgUrl(item?.image || item?.inventoryItem?.image || '')}
                  alt={item?.name}
                  style={{ maxWidth: 100, height: 100, objectFit: 'contain' }}
                />
              ) : (
                <img
                  src="/images/not-found.png"
                  alt={item?.name}
                  style={{ maxWidth: 100, height: 100, objectFit: 'contain' }}
                />
              )}
            </Grid>
          )}
          <Grid item md={2}>
            <Box display="flex" alignItems="center" gap={2}>
              <Typography variant="subtitle1">{item.name}</Typography>
              {item?.isBestSeller && (
                <Chip label="Best Seller" color="error" size="small" />
              )}
            </Box>

          </Grid>
          <Grid item md={2}>
            <Typography variant="subtitle1">
              {item?.options && item.options.length > 0
                ? `From $${smallestOption?.price.toFixed(2)}`
                : `$${item.price.toFixed(2)}`}
            </Typography>
          </Grid>
          <Grid item md={3} xs={12}>
            <Box display="flex" gap={1}>
              <DeleteModal
                targetObj={item}
                handleDelete={handleDeleteItem}
                includedButton
              />
              {/* <EditItem
                targetItem={item}
                handleUpdateItem={handleUpdateItem}
                showNotification={showNotification}
              /> */}
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </>
  );
}
