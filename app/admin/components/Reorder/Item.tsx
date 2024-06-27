import { IItem, Notification } from '@/app/utils/type';
import { Box, Grid, Paper, Typography } from '@mui/material';
import React, { Dispatch, SetStateAction } from 'react';
import EditItemAvailability from '../Modals/edit/EditItemAvailability';
import DeleteModal from '../Modals/delete/DeleteModal';
import EditItem from '../Modals/edit/EditItem';
import { SubCategory } from '@prisma/client';

interface IProps {
  item: IItem;
  handleDeleteItem: (targetItem: IItem) => Promise<void>;
  handleUpdateItem: (updatedItem: IItem) => Promise<void>;
  subCategories: SubCategory[];
  setNotification: Dispatch<SetStateAction<Notification>>;
}

export default function Item({
  item,
  handleUpdateItem,
  handleDeleteItem,
  setNotification,
  subCategories,
}: IProps) {
  return (
    <Paper elevation={0} sx={{ py: 2, }}>
      <Grid container alignItems="center" columnSpacing={1}>
        <Grid item lg={1} md={12}>
          <EditItemAvailability
            item={item}
            setNotification={setNotification}
            handleUpdateItem={handleUpdateItem}
          />
        </Grid>
        <Grid item md={4} >
          <Typography variant="subtitle1">{item.name}</Typography>
        </Grid>
        <Grid item md={2}>
          <Typography variant="subtitle1">${item.price.toFixed(2)}</Typography>
        </Grid>
        <Grid item md={2}>
          <Typography variant="subtitle1">{item?.subCategory?.name}</Typography>
        </Grid>
        <Grid item md={3} xs={12}>
          <Box display="flex" gap={1}>
            <DeleteModal
              targetObj={item}
              handleDelete={handleDeleteItem}
              includedButton
            />
            <EditItem
              targetItem={item}
              subCategories={subCategories}
              handleUpdateItem={handleUpdateItem}
            />
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
}
