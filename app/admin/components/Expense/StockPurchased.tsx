import { SWRFetchData } from '@/app/utils/db';
import { API_URL } from '@/app/utils/enum';
import { YYYYMMDDFormat } from '@/app/utils/time'
import useSelectDate from '@/hooks/useSelectDate'
import { Box, Button, Divider, Grid, MenuItem, Select, TextField, Typography } from '@mui/material'
import { m } from 'framer-motion';
import React, { useState } from 'react'

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


    // TODO: Add prompted item into purchased items
    // TODO: /api/inventory/expense to add expense for stock purchased
  return (
    <Box display="flex" flexDirection="column" gap={3}>
        <Grid container spacing={3}>
            <Grid item xs={12}> 
                <Select fullWidth value={promptedItem.itemId}>
                    <MenuItem value={-1}>-- Choose an item --</MenuItem>
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
                />
            </Grid>
            <Grid item xs={12} md={6}> 
                <TextField 
                    fullWidth
                    label="Quantity"
                    type="number"
                    value={promptedItem.unitPrice}
                />
            </Grid>

            <Grid item xs={12}>
                <Button variant="contained" fullWidth>Add</Button>
            </Grid>
        </Grid>

        <Divider sx={{my: 2}}>Expense Information</Divider>

        <Box display="flex" flexDirection="column" gap={2}>
            <Typography variant="h6">Date</Typography>
            {SelectDate}
        </Box>
    </Box>
  )
}
