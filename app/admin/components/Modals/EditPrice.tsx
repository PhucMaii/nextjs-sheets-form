import { OrderedItems } from '@/app/utils/type';
import { LoadingButton } from '@mui/lab';
import { Box, Checkbox, Divider, FormControlLabel, Grid, Modal, Radio, RadioGroup, TextField, Typography } from '@mui/material';
import React, { useState } from 'react';
import { BoxModal } from './styled';
import { ModalProps } from './type';

interface PropTypes extends ModalProps {
    items: OrderedItems[];
}

export default function EditPrice({
    open,
    onClose,
    items
}: PropTypes) {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [itemList, setItemList] = useState<OrderedItems[]>(items);

    const handleUpdatePrice = async () => {

    }

    const handleItemOnChange = (e: any, targetItem: OrderedItems) => {
        console.log('run')
        const newItemList = itemList.map((item: OrderedItems) => {
            if(item.id === targetItem.id) {
                return {...item, price: +e.target.value};
            }
            return item;
        });
        setItemList(newItemList);
    }

  return (
    <Modal open={open} onClose={onClose}>
      <BoxModal display="flex" flexDirection="column" gap={2}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h4">Edit Price</Typography>
          <LoadingButton
            variant="contained"
            loadingIndicator="Saving..."
            loading={isLoading}
            onClick={handleUpdatePrice}
          >
            Save
          </LoadingButton>
        </Box>
        <RadioGroup row>
          <FormControlLabel value="create" control={<Radio />} label="Create new category" />
          <FormControlLabel value="update" control={<Radio />} label="Update the category" />
        </RadioGroup>
        <Divider />
        <Box overflow="auto" maxHeight="70vh" mt={2}>
          <Grid
            container
            alignItems="center"
            columnSpacing={2}
            rowGap={4}
            mt={2}
          >
            {itemList.length > 0 &&
              itemList.map((item: any) => {
                return (
                  <>
                    <Grid item xs={6}>
                      {item.name} (Unit Price $)
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Unit Price ($)"
                        value={item.price}
                        onChange={(e) => handleItemOnChange(e, item)}
                        type="number"
                        inputProps={{ min: 0 }}
                      />
                    </Grid>
                  </>
                );
              })}
          </Grid>
        </Box>
      </BoxModal>
    </Modal>
  );
}
