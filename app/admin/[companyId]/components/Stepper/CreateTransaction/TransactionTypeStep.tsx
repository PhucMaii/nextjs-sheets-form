import { blue, blueGrey } from '@mui/material/colors';
import { Dispatch, SetStateAction } from 'react';

import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Fade,
} from '@mui/material';

import { Payment } from '@mui/icons-material';
import { BoxIcon } from 'lucide-react';

export default function TransactionTypeStep({
  transactionType,
  setTransactionType,
}: {
  transactionType: 'stock' | 'other' | '';
  setTransactionType: Dispatch<SetStateAction<'stock' | 'other' | ''>>;
}) {
  return (
    <Fade in timeout={500}>
      <Box>
        <Typography variant="h6" gutterBottom color={blueGrey[800]}>
          What type of transaction are you creating?
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          Choose the type that best describes your expense
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                cursor: 'pointer',
                border:
                  transactionType === 'stock'
                    ? `2px solid ${blue[500]}`
                    : '2px solid transparent',
                transition: 'all 0.3s ease',
                height: '100%',
                '&:hover': {
                  boxShadow: 3,
                  transform: 'translateY(-2px)',
                },
              }}
              onClick={() => setTransactionType('stock')}
            >
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <BoxIcon size={48} color={blue[500]} />
                <Typography variant="h6" gutterBottom>
                  Stock Purchase
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Track inventory purchases with detailed item breakdown,
                  automatic tax calculations
                </Typography>
                {transactionType === 'stock' && (
                  <Chip
                    label="Selected"
                    color="primary"
                    size="small"
                    sx={{ mt: 2 }}
                  />
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card
              sx={{
                cursor: 'pointer',
                border:
                  transactionType === 'other'
                    ? `2px solid ${blue[500]}`
                    : '2px solid transparent',
                transition: 'all 0.3s ease',
                height: '100%',
                boxShadow: 1,
                '&:hover': {
                  boxShadow: 3,
                  transform: 'translateY(-2px)',
                },
              }}
              onClick={() => setTransactionType('other')}
            >
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <Payment sx={{ fontSize: 48, color: blue[500], mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Other Expense
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  General business expenses like utilities, rent, services, and
                  miscellaneous costs
                </Typography>
                {transactionType === 'other' && (
                  <Chip
                    label="Selected"
                    color="primary"
                    size="small"
                    sx={{ mt: 2 }}
                  />
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Fade>
  );
}
