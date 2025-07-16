import { blue, blueGrey } from '@mui/material/colors';

import React from 'react';
import { Box, Divider, Fade, Grid, Paper, Typography, Chip, Alert } from '@mui/material';
import { TRANSACTION_STATUS } from '@/app/utils/enum';
import { BorderSection } from '../../../reports/styled';


export default function ReviewStep({
  transactionType,
  selectedDate,
  formData,
  expenseItems,
}: {
  transactionType: string;
  selectedDate: any;
  formData: any;
  expenseItems: any;
}) {
  return (
  <Fade in timeout={500}>
    <Box>
      <Typography variant="h6" gutterBottom color={blueGrey[800]}>
        Review Your Transaction
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Please review all details before submitting
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <BorderSection sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Transaction Summary
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Type:
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {transactionType === 'stock'
                    ? 'Stock Purchase'
                    : 'Other Expense'}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Date:
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {selectedDate.format('MMMM DD, YYYY')}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Spent By:
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {formData.spentBy || 'Not specified'}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Payment Method:
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {formData.paymentMethod.name || 'Not specified'}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  Description:
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {formData.description || 'No description provided'}
                </Typography>
              </Grid>
            </Grid>

            {transactionType === 'stock' && expenseItems.length > 0 && (
              <Box mt={3}>
                <Typography variant="subtitle1" gutterBottom>
                  Items
                </Typography>
                <Divider sx={{ mb: 2 }} />
                {expenseItems.map((item: any) => (
                  <Box key={item.id} mb={1}>
                    <Grid container spacing={1}>
                      <Grid item xs={6}>
                        <Typography variant="body2">
                          {item.inventoryItem.name || 'Untitled Item'}
                        </Typography>
                      </Grid>
                      <Grid item xs={2}>
                        <Typography variant="body2">
                          {item.quantity}x
                        </Typography>
                      </Grid>
                      <Grid item xs={2}>
                        <Typography variant="body2">
                          ${item.unitPrice.toFixed(2)}
                        </Typography>
                      </Grid>
                      <Grid item xs={2}>
                        <Typography variant="body2" fontWeight="medium">
                          ${item.total.toFixed(2)}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                ))}
              </Box>
            )}
          </BorderSection>
        </Grid>

        <Grid item xs={12} md={4}>
          <BorderSection sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Financial Summary
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {transactionType === 'stock' ? (
              <Box>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">Subtotal:</Typography>
                  <Typography variant="body2">
                    ${formData.subTotal.toFixed(2)}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">GST (5%):</Typography>
                  <Typography variant="body2">
                    ${formData.GST.toFixed(2)}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">PST (7%):</Typography>
                  <Typography variant="body2">
                    ${formData.PST.toFixed(2)}
                  </Typography>
                </Box>
                {formData.discount > 0 && (
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">Discount:</Typography>
                    <Typography variant="body2" color="success.main">
                      -${formData.discount.toFixed(2)}
                    </Typography>
                  </Box>
                )}
                <Divider sx={{ my: 2 }} />
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="h6">Total:</Typography>
                  <Typography variant="h6" color="primary">
                    ${formData.total.toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            ) : (
              <Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="h6">Total Amount:</Typography>
                  <Typography variant="h6" color="primary">
                    ${formData.total.toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            )}

            <Box mt={3}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Status:
              </Typography>
              <Chip
                label={formData.status}
                color={
                  formData.status === TRANSACTION_STATUS.PAID
                    ? 'success'
                    : 'warning'
                }
                size="small"
              />
            </Box>
          </BorderSection>
        </Grid>
      </Grid>

      {/* Validation Alerts */}
      <Box mt={3}>
        {!formData.spentBy && (
          <Alert severity="warning" sx={{ mb: 1 }}>
            Please select who spent the money
          </Alert>
        )}
        {formData.paymentMethodId === -1 && (
          <Alert severity="warning" sx={{ mb: 1 }}>
            Please select a payment method
          </Alert>
        )}
        {!formData.description && (
          <Alert severity="info" sx={{ mb: 1 }}>
            Consider adding a description for better record keeping
          </Alert>
        )}
      </Box>
    </Box>
  </Fade>
  );
}
