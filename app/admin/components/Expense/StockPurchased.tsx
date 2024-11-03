import { SWRFetchData } from '@/app/utils/db';
import { API_URL } from '@/app/utils/enum';
import { YYYYMMDDFormat } from '@/app/utils/time'
import useSelectDate from '@/hooks/useSelectDate'
import { Box, Button, Divider, Grid, IconButton, MenuItem, Select, TextField, Typography } from '@mui/material';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import React, { Fragment, useState } from 'react'
import { errorColor } from '@/theme/color';

export default function StockPurchased() {
    const [newExpense, setNewExpense] = useState<any>({
        amount: 0,
        description: '',
        paymentMethodId: -1,
        spentBy: '-- Choose who spent --',
    });
    const [purchasedItems, setPurchasedItems] = useState<any[]>([]);
    const [promptedItem, setPromptedItem] = useState<any>({
        itemId: -1,
        quantity: 0,
        unitPrice: 0,
    });

    const todayString = YYYYMMDDFormat(new Date());
    const { date, SelectDate} = useSelectDate(todayString, true);

    const [inventoryItems] = SWRFetchData(`${API_URL.ADMIN}/inventory`);

    const selectPromptedItem = (e: any) => {
        const newId = +e.target.value;

        const item = inventoryItems?.data?.find((item: any) => {
            return item.id === newId;
        });

        setPromptedItem({
            ...promptedItem,
            itemId: newId,
            unitPrice: item?.price,
        })
    }
    
    // TODO: Add prompted item into purchased items
    const addPromptedItem = () => {
        setPurchasedItems([...purchasedItems, promptedItem]);
        setPromptedItem({
            itemId: -1,
            quantity: 0,
            unitPrice: 0,
        })
    }

    const handleChangeItem = (e: any, targetItem: any, keyChange: string) => {
        e.preventDefault();
        const newItemList = purchasedItems.map((item: any) => {
          if (item.id === targetItem.id) {
            if (keyChange === 'quantity') {
              const totalPrice = item.price * +e.target.value;
              return { ...item, quantity: +e.target.value, totalPrice };
            }
            if (keyChange === 'price') {
              const totalPrice = item.quantity * +e.target.value;
              return { ...item, price: +e.target.value, totalPrice };
            }
            return item;
          }
    
          return item;
        });
    
        setPurchasedItems(newItemList);
      };

      const removeItem = (itemName: string) => {
        const newItemList = purchasedItems.filter((item: any) => {
          return item.name !== itemName;
        });
    
        setPurchasedItems(newItemList);
      };


    // TODO: /api/inventory/expense to add expense for stock purchased
  return (
    <Box display="flex" flexDirection="column" gap={3}>
        <Grid container spacing={3}>
            <Grid item xs={12}> 
                <Select fullWidth value={promptedItem.itemId} onChange={selectPromptedItem}>
                    <MenuItem value={-1} disabled>-- Choose an item --</MenuItem>
                    {
                        inventoryItems && inventoryItems?.data?.map((item: any) => {
                            return (
                                <MenuItem value={item.id}>{item.name}</MenuItem>
                            )
                        })
                    }
                </Select>
            </Grid>

            <Grid item xs={12} md={6}> 
                <TextField 
                    fullWidth
                    label="Unit Price"
                    type="number"
                    value={promptedItem.unitPrice}
                    onChange={(e: any) => setPromptedItem({...promptedItem, unitPrice: +e.target.value})}
                />
            </Grid>
            <Grid item xs={12} md={6}> 
                <TextField 
                    fullWidth
                    label="Quantity"
                    type="number"
                    value={promptedItem.quantity}
                    onChange={(e: any) => setPromptedItem({...promptedItem, quantity: +e.target.value})}

                />
            </Grid>

            <Grid item xs={12}>
                <Button variant="contained" fullWidth onClick={addPromptedItem}>Add</Button>
            </Grid>
        </Grid>

        <Divider sx={{my: 2}}>Expense Information</Divider>

        {purchasedItems.length > 0 &&
                purchasedItems.map((item: any, index) => {
                  return (
                    <Fragment key={index}>
                      <Grid item xs={12} fontWeight="bold">
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="h6" fontWeight="bold">
                            {item.name}
                          </Typography>
                          <IconButton onClick={() => removeItem(item.name)}>
                            <RemoveCircleIcon sx={{ color: errorColor }} />
                          </IconButton>
                        </Box>
                      </Grid>
                      <Grid item container columnSpacing={2}>
                        <Grid item xs={6} textAlign="right">
                          <TextField
                            fullWidth
                            label="Unit Price ($)"
                            value={item.price}
                            onChange={(e) => handleChangeItem(e, item, 'price')}
                            type="number"
                            inputProps={{ min: 0 }}
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <TextField
                            fullWidth
                            label="Quantity"
                            value={item.quantity}
                            onChange={(e) =>
                              handleChangeItem(e, item, 'quantity')
                            }
                            type="number"
                            inputProps={{ min: 0 }}
                          />
                        </Grid>
                      </Grid>
                    </Fragment>
                  );
                })}
        <Box display="flex" flexDirection="column" gap={2}>
            <Typography variant="h6">Date</Typography>
            {SelectDate}
        </Box>
    </Box>
  )
}
