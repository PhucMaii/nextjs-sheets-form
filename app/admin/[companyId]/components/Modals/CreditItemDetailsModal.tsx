import { ICreditItem } from '@/app/utils/type';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  Paper,
  Box,
} from '@mui/material';
import { Receipt } from '@mui/icons-material';
import { formatCurrency } from '@/app/utils/number';
import { error } from '@/theme/color';

interface IProps {
  open: boolean;
  onClose: () => void;
  items: ICreditItem[];
  creditId: number;
}

export default function CreditItemDetailsModal({
  open,
  onClose,
  items,
  creditId,
}: IProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          maxHeight: '90vh',
          overflowY: 'scroll',
          overflowX: 'hidden',
        },
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={2}>
          <Receipt color="primary" />
          <Typography variant="h6" fontWeight="bold">
            Credit Items Details
          </Typography>
          <Chip
            label={`Credit #${creditId}`}
            color="primary"
            variant="outlined"
          />
        </Box>
      </DialogTitle>
      <DialogContent>
        <TableContainer component={Paper} elevation={0}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Item Name</TableCell>
                <TableCell align="right">Qty</TableCell>
                <TableCell align="right">Price</TableCell>
                <TableCell align="right">Actual Price</TableCell>
                <TableCell align="right">Price Difference</TableCell>
                <TableCell align="right">Total Credit</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {item.inventoryItem.name}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">{item.quantity}</TableCell>
                  <TableCell align="right">
                    {formatCurrency(item.orderedItem.price)}
                  </TableCell>
                  <TableCell align="right">
                    {formatCurrency(item.actualPrice)}
                  </TableCell>
                  <TableCell align="right" sx={{ color: error.main }}>
                    {formatCurrency(item.priceDifference)}
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ fontWeight: 'bold', color: error.main }}
                  >
                    {formatCurrency(item.priceDifference * item.quantity)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
