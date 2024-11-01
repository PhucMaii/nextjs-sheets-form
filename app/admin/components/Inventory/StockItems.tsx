import { Box, Button, Grid, TextField, Typography } from '@mui/material'
import React from 'react';
import AddIcon from '@mui/icons-material/Add';
import InventoryTable from '../Tables/InventoryTable';

export default function StockItems() {
  return (
    <Box display="flex" flexDirection="column">
        <Grid container alignItems='center' spacing={1}>
            <Grid item xs={10.5}>
                <TextField
                    label="Search"
                    placeholder='Search items by name...'
                    size="small"
                    variant="filled"
                    fullWidth
                />
            </Grid>

            <Grid item xs={1.5}>
                <Button>
                    <Box display="flex" alignItems="center" gap={0.5}>
                        <AddIcon />
                        <Typography variant="body2" fontWeight="bold">New Item</Typography>
                    </Box>
                </Button>
            </Grid>
        </Grid>

        <InventoryTable />
    </Box>
  )
}
